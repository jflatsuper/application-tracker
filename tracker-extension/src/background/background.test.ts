import { beforeEach, describe, expect, it, vi } from "vitest";

type Listener = (...args: never[]) => unknown;

function area() {
  const data: Record<string, unknown> = {};
  return {
    get: async (key: string) => (key in data ? { [key]: data[key] } : {}),
    set: async (items: Record<string, unknown>) =>
      void Object.assign(data, items),
    remove: async (keys: string[]) => keys.forEach((key) => delete data[key]),
  };
}

const created: {
  id: string;
  options: chrome.notifications.NotificationCreateOptions;
}[] = [];
let onMessage: (
  message: unknown,
  sender: unknown,
  respond: () => void,
) => unknown;
let onExternal: (
  message: unknown,
  sender: unknown,
  respond: (reply: unknown) => void,
) => unknown;
let guest = false;
let plan = "pro";
const fetched: string[] = [];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

async function boot() {
  vi.resetModules();
  created.length = 0;
  fetched.length = 0;
  const local = area();
  await local.set({ refreshToken: "R1" });
  const session = area();
  await session.set({ accessToken: "A1" });

  vi.stubGlobal("chrome", {
    runtime: {
      id: "me",
      onInstalled: { addListener: vi.fn() },
      onStartup: { addListener: vi.fn() },
      onMessage: {
        addListener: (fn: typeof onMessage) => {
          onMessage = fn;
        },
      },
      onMessageExternal: {
        addListener: (fn: typeof onExternal) => {
          onExternal = fn;
        },
      },
    },
    storage: { local, session },
    scripting: {
      getRegisteredContentScripts: async () => [],
      registerContentScripts: vi.fn(),
      unregisterContentScripts: vi.fn(),
    },
    permissions: { contains: async () => true },
    notifications: {
      create: (
        id: string,
        options: chrome.notifications.NotificationCreateOptions,
      ) => void created.push({ id, options }),
      clear: vi.fn(),
      onButtonClicked: { addListener: vi.fn() },
      onClicked: { addListener: vi.fn() },
    },
    tabs: { create: vi.fn() },
  } as unknown as typeof chrome);

  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit = {}) => {
      const path = new URL(url).pathname;
      const method = init.method ?? "GET";
      fetched.push(`${method} ${path}`);
      if (path.endsWith("/auth/refresh")) {
        return json({ access_token: "A2", refresh_token: "R2" });
      }
      if (path.endsWith("/users/me")) {
        return json({ email: "a@b.c", full_name: null, is_anonymous: guest });
      }
      if (path.endsWith("/billing/entitlements")) {
        return json({ plan_code: plan, plan_name: plan, status: "active" });
      }
      if (path.endsWith("/applications") && method === "GET") {
        return json({ items: [], total: 0 });
      }
      if (path.endsWith("/applications") && method === "POST") {
        return json({ id: "new-1", ...JSON.parse(init.body as string) });
      }
      return json({}, 404);
    }),
  );

  await import("./index");
}

const fromLever = {
  id: "me",
  url: "https://jobs.lever.co/acme/1/thanks",
  tab: { url: "https://jobs.lever.co/acme/1/thanks" },
};
const job = {
  title: "Senior Engineer",
  company: "Acme",
  location: "",
  url: "https://jobs.lever.co/acme/1",
};
const flush = () => new Promise((resolve) => setTimeout(resolve, 20));

beforeEach(async () => {
  plan = "pro";
  guest = false;
  await boot();
});

describe("the worker", () => {
  it("adds the job and offers Undo when the account is on Pro", async () => {
    onMessage({ type: "application-submitted", job }, fromLever, () => {});
    await flush();
    expect(fetched).toContain("POST /api/v1/applications");
    expect(created.at(-1)?.options).toMatchObject({
      title: "Added to Refresha",
      buttons: [{ title: "Undo" }, { title: "Open" }],
    });
  });

  it("adds nothing for a free account and says why", async () => {
    plan = "free";
    await boot();
    onMessage({ type: "application-submitted", job }, fromLever, () => {});
    await flush();
    expect(fetched).not.toContain("POST /api/v1/applications");
    expect(created.at(-1)?.options.title).toMatch(/part of Pro/);
  });

  it("flags a job whose role it couldn't read", async () => {
    onMessage(
      { type: "application-submitted", job: { ...job, title: "" } },
      fromLever,
      () => {},
    );
    await flush();
    const post = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.find(
      ([, init]) =>
        init?.method === "POST" && String(init.body).includes("company_name"),
    );
    expect(JSON.parse(post![1].body)).toMatchObject({
      title: "Job to review",
      notes: expect.stringContaining("Check the details"),
    });
  });

  it("ignores messages from other extensions or from other sites", async () => {
    onMessage(
      { type: "application-submitted", job },
      { ...fromLever, id: "other" },
      () => {},
    );
    onMessage(
      { type: "application-submitted", job },
      {
        id: "me",
        url: "https://evil.example/",
        tab: { url: "https://evil.example/" },
      },
      () => {},
    );
    await flush();
    expect(fetched).toEqual([]);
    expect(created).toEqual([]);
  });
});

describe("connecting from the web app", () => {
  const web = { origin: "https://app.example.test" };
  const token = "r".repeat(40);

  const ask = (message: unknown, sender: unknown) =>
    new Promise<unknown>((resolve) => {
      const kept = onExternal(message, sender, resolve);
      // No listener return of `true` means it ignored the message.
      if (kept !== true) resolve("ignored");
    });

  it("signs in with the handed-over token from the real web app", async () => {
    const reply = await ask({ type: "connect", refresh_token: token }, web);
    expect(reply).toEqual({ ok: true });
    expect(fetched).toContain("POST /api/v1/auth/refresh");
    expect(fetched).toContain("GET /api/v1/users/me");
  });

  it("ignores any other site", async () => {
    const reply = await ask(
      { type: "connect", refresh_token: token },
      { origin: "https://evil.example" },
    );
    expect(reply).toBe("ignored");
    expect(fetched).toEqual([]);
  });

  it("rejects a token that can't be real", async () => {
    const reply = await ask({ type: "connect", refresh_token: "short" }, web);
    expect(reply).toEqual({ ok: false, error: "invalid" });
    expect(fetched).toEqual([]);
  });

  it("refuses a guest account", async () => {
    guest = true;
    const reply = await ask({ type: "connect", refresh_token: token }, web);
    expect(reply).toEqual({ ok: false, error: "guest" });
  });
});

// Keeps the listener type referenced so an unused-type lint can't remove it.
export type { Listener };
