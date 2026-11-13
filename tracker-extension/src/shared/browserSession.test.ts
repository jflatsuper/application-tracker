import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  SignedOutError,
  adoptBrowserSession,
  hasSession,
  listApplications,
  login,
  revalidateSession,
  usesBrowserSession,
} from "./api";

function area() {
  const data: Record<string, unknown> = {};
  return {
    data,
    get: async (key: string) => (key in data ? { [key]: data[key] } : {}),
    set: async (items: Record<string, unknown>) =>
      void Object.assign(data, items),
    remove: async (keys: string[]) => keys.forEach((key) => delete data[key]),
  };
}

type Call = { path: string; init: RequestInit };
let calls: Call[];
let local: ReturnType<typeof area>;
let websiteSignedIn: boolean;
let guest: boolean;
let offline: boolean;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

beforeEach(() => {
  local = area();
  calls = [];
  websiteSignedIn = true;
  guest = false;
  offline = false;
  vi.stubGlobal("chrome", { storage: { local, session: area() } });
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit = {}) => {
      if (offline) throw new TypeError("Failed to fetch");
      const path = new URL(url).pathname;
      calls.push({ path, init });
      if (path.endsWith("/auth/refresh")) {
        // The website's cookie only arrives when the request asks for it.
        return websiteSignedIn && init.credentials === "include"
          ? json({ access_token: "A-web", refresh_token: "R-web" })
          : json({ detail: "no cookie" }, 401);
      }
      if (path.endsWith("/auth/login")) {
        return json({
          user: { email: "own@example.com", full_name: null },
          tokens: { access_token: "A-own", refresh_token: "R-own" },
        });
      }
      if (path.endsWith("/users/me")) {
        return json({
          email: "web@example.com",
          full_name: "Web",
          is_anonymous: guest,
        });
      }
      if (path.endsWith("/applications")) return json({ items: [], total: 0 });
      return json({}, 404);
    }),
  );
});

describe("borrowing the website's session", () => {
  it("signs in with no password and keeps no refresh token", async () => {
    const user = await adoptBrowserSession();

    expect(user).toEqual({ email: "web@example.com", full_name: "Web" });
    const refresh = calls.find((c) => c.path.endsWith("/auth/refresh"))!;
    expect(refresh.init.credentials).toBe("include");
    expect(refresh.init.body).toBeUndefined();
    expect(local.data.refreshToken).toBeUndefined();
    expect(await hasSession()).toBe(true);
    expect(await usesBrowserSession()).toBe(true);
  });

  it("sends cookies only to refresh, and uses the access token afterwards", async () => {
    await adoptBrowserSession();
    calls.length = 0;
    await listApplications();

    const request = calls.find((c) => c.path.endsWith("/applications"))!;
    expect(request.init.credentials).toBe("omit");
    expect((request.init.headers as Record<string, string>).Authorization).toBe(
      "Bearer A-web",
    );
  });

  it("gets a new access token from the cookie when the old one is rejected", async () => {
    await adoptBrowserSession();
    let first = true;
    const original = fetch as unknown as (
      url: string,
      init: RequestInit,
    ) => Promise<Response>;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init: RequestInit = {}) => {
        if (new URL(url).pathname.endsWith("/applications") && first) {
          first = false;
          return json({}, 401);
        }
        return original(url, init);
      }),
    );
    expect(await listApplications()).toEqual([]);
  });

  it("finds nothing to borrow when the website isn't signed in", async () => {
    websiteSignedIn = false;
    expect(await adoptBrowserSession()).toBeNull();
    expect(await hasSession()).toBe(false);
    expect(local.data.sessionMode).toBeUndefined();
  });

  it("doesn't borrow a guest session", async () => {
    guest = true;
    expect(await adoptBrowserSession()).toBeNull();
    expect(await hasSession()).toBe(false);
  });

  it("leaves nothing behind when the API can't be reached", async () => {
    offline = true;
    await expect(adoptBrowserSession()).rejects.toBeInstanceOf(ApiError);
    expect(await hasSession()).toBe(false);
  });

  it("gives way to the extension's own sign-in", async () => {
    await adoptBrowserSession();
    await login("own@example.com", "pw");
    expect(await usesBrowserSession()).toBe(false);
    expect(local.data.refreshToken).toBe("R-own");
  });
});

describe("when the website signs out", () => {
  it("signs the extension out when the popup re-checks", async () => {
    await adoptBrowserSession();
    websiteSignedIn = false;

    await expect(revalidateSession()).rejects.toBeInstanceOf(SignedOutError);
    expect(await hasSession()).toBe(false);
  });

  it("doesn't trust the cached token for more than a minute", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    try {
      await adoptBrowserSession();
      const refreshes = () =>
        calls.filter((c) => c.path.endsWith("/auth/refresh")).length;
      const before = refreshes();

      // Within the minute the cached token is used, with no extra cookie check.
      await listApplications();
      expect(refreshes()).toBe(before);

      // Later, with the website signed out, the next request fails.
      vi.setSystemTime(Date.now() + 61_000);
      websiteSignedIn = false;
      await expect(listApplications()).rejects.toBeInstanceOf(SignedOutError);
      expect(await hasSession()).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("leaves the extension's own sign-in alone", async () => {
    await login("own@example.com", "pw");
    websiteSignedIn = false;

    await expect(revalidateSession()).resolves.toBeUndefined();
    expect(await hasSession()).toBe(true);
  });
});
