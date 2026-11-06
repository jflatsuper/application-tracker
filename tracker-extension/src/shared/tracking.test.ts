import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProRequiredError, login } from "./api";
import { findExisting, trackJob } from "./tracking";

// A tiny in-memory chrome.storage.
function area() {
  const data: Record<string, unknown> = {};
  return {
    get: async (key: string) => (key in data ? { [key]: data[key] } : {}),
    set: async (items: Record<string, unknown>) => void Object.assign(data, items),
    remove: async (keys: string[]) => keys.forEach((key) => delete data[key]),
  };
}

type Call = { url: string; init: RequestInit };
let calls: Call[];
let routes: Record<string, (init: RequestInit) => unknown>;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

beforeEach(async () => {
  vi.stubGlobal("chrome", {
    storage: { local: area(), session: area() },
  });
  calls = [];
  routes = {};
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      const key = `${init.method ?? "GET"} ${new URL(url).pathname}`;
      const handler = routes[key];
      if (!handler) return json({ detail: "no route " + key }, 404);
      const out = handler(init);
      return out instanceof Response ? out : json(out);
    }),
  );
  routes["POST /api/v1/auth/login"] = () => ({
    user: { email: "a@b.c", full_name: null },
    tokens: { access_token: "A1", refresh_token: "R1" },
  });
  await login("a@b.c", "pw");
  calls.length = 0;
});

const job = {
  title: "Senior Engineer",
  company: "Acme",
  location: "Lagos",
  url: "https://jobs.lever.co/acme/1",
};
const list = (items: unknown[]) => () => ({ items, total: items.length });

describe("the Pro gate", () => {
  it("refuses a free account and never touches applications", async () => {
    routes["GET /api/v1/billing/entitlements"] = () => ({
      plan_code: "free",
      plan_name: "Free",
      status: null,
    });
    await expect(trackJob(job, "applied")).rejects.toBeInstanceOf(
      ProRequiredError,
    );
    expect(calls.some((c) => c.url.includes("/applications"))).toBe(false);
  });

  it("lets a Pro account through", async () => {
    routes["GET /api/v1/billing/entitlements"] = () => ({
      plan_code: "pro",
      plan_name: "Pro",
      status: "active",
    });
    routes["GET /api/v1/applications"] = list([]);
    routes["POST /api/v1/applications"] = (init) => ({
      id: "new",
      ...JSON.parse(init.body as string),
    });
    const result = await trackJob(job, "applied", { needsReview: true });
    expect(result.kind).toBe("created");
    const create = calls.find((c) => c.init.method === "POST")!;
    expect(JSON.parse(create.init.body as string)).toMatchObject({
      company_name: "Acme",
      title: "Senior Engineer",
      status: "applied",
      tier: 0,
      notes: expect.stringContaining("Check the details"),
    });
  });
});

describe("tracking a job", () => {
  beforeEach(() => {
    routes["GET /api/v1/billing/entitlements"] = () => ({
      plan_code: "pro",
      plan_name: "Pro",
      status: "active",
    });
  });

  it("moves a saved twin to applied instead of duplicating it", async () => {
    routes["GET /api/v1/applications"] = list([
      { id: "x1", company_name: "ACME", title: "senior engineer", status: "saved" },
    ]);
    routes["POST /api/v1/applications/x1/status"] = () => ({
      id: "x1",
      company_name: "ACME",
      title: "senior engineer",
      status: "applied",
    });
    const result = await trackJob(job, "applied");
    expect(result.kind).toBe("updated");
    expect(calls.some((c) => c.url.endsWith("/applications") && c.init.method === "POST")).toBe(false);
  });

  it("leaves one that's already applied alone", async () => {
    routes["GET /api/v1/applications"] = list([
      { id: "x2", company_name: "Acme", title: "Senior Engineer", status: "applied" },
    ]);
    expect((await trackJob(job, "applied")).kind).toBe("unchanged");
  });
});

describe("findExisting", () => {
  it("needs both a company and a title to match", () => {
    const apps = [{ id: "1", company_name: "Acme", title: "Dev", status: "saved" }];
    expect(findExisting(apps, { company: "", title: "Dev" })).toBeUndefined();
    expect(findExisting(apps, { company: "Acme", title: "Dev" })?.id).toBe("1");
  });
});

describe("tokens", () => {
  it("sends no cookies and refreshes with its own token on a 401", async () => {
    let first = true;
    routes["GET /api/v1/billing/entitlements"] = () => {
      if (first) {
        first = false;
        return new Response("{}", { status: 401 });
      }
      return { plan_code: "pro", plan_name: "Pro", status: "active" };
    };
    routes["POST /api/v1/auth/refresh"] = () => ({
      access_token: "A2",
      refresh_token: "R2",
    });
    routes["GET /api/v1/applications"] = list([]);
    routes["POST /api/v1/applications"] = () => ({ id: "n" });

    await trackJob(job, "saved");

    const refresh = calls.find((c) => c.url.endsWith("/auth/refresh"))!;
    expect(JSON.parse(refresh.init.body as string)).toEqual({ refresh_token: "R1" });
    expect(calls.every((c) => c.init.credentials === "omit")).toBe(true);
    const last = calls[calls.length - 1];
    expect((last.init.headers as Record<string, string>).Authorization).toBe("Bearer A2");
  });
});
