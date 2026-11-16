import { API_BASE } from "./config";
import { local, session } from "./storage";
import type { ApplicationSummary, Entitlements, StoredUser } from "./types";

// Two ways to be signed in, and the first match wins:
//   1. Its own tokens: signing in with email, or a session handed over by the
//      website's "Connect the extension" page. Stored here, independent of the
//      website.
//   2. The browser session: if you're signed in on the Refresha website, the
//      browser sends that site's cookie when the extension calls the API, and
//      the extension just borrows it. Nothing long-lived is stored, and signing
//      out of the website signs the extension out too.

export class ApiError extends Error {
  status: number;
  detail: unknown;
  retryAfter?: number;
  constructor(status: number, detail?: unknown, retryAfter?: number) {
    super(`Request failed: ${status}`);
    this.status = status;
    this.detail = detail;
    this.retryAfter = retryAfter;
  }
}

// Thrown when there are no usable tokens: the person has to sign in again.
export class SignedOutError extends Error {
  constructor() {
    super("Signed out");
  }
}

type TokenPair = { access_token: string; refresh_token: string };

const REFRESH = "refreshToken";
const ACCESS = "accessToken";
const USER = "user";
const MODE = "sessionMode"; // "browser" when borrowing the website's session
const PLAN = "plan";
const PLAN_TTL_MS = 5 * 60 * 1000;
// When borrowing the website's session, the cookie is the truth, not the cached
// access token (which outlives a website sign-out). So the cookie is asked again
// whenever the token was last confirmed longer ago than this.
const VERIFIED = "verifiedAt";
const VERIFY_TTL_MS = 60 * 1000;

async function saveTokens(tokens: TokenPair) {
  await local.remove(MODE);
  await local.set(REFRESH, tokens.refresh_token);
  await session.set(ACCESS, tokens.access_token);
}

export async function clearSession() {
  await local.remove(REFRESH, USER, MODE);
  await session.remove(ACCESS, PLAN, VERIFIED);
}

export const hasSession = async () =>
  Boolean(await local.get<string>(REFRESH)) ||
  (await local.get<string>(MODE)) === "browser";

// True when the session is the website's, so there's nothing to sign out of here.
export const usesBrowserSession = async () =>
  !(await local.get<string>(REFRESH)) &&
  (await local.get<string>(MODE)) === "browser";
export const storedUser = () => local.get<StoredUser>(USER);

function retryAfterSeconds(headers: Headers): number | undefined {
  const value = headers.get("Retry-After")?.trim();
  return value && /^\d+$/.test(value) ? Number(value) : undefined;
}

async function send(
  path: string,
  init: RequestInit,
  token?: string,
  withCookies = false,
) {
  return fetch(`${API_BASE}${path}`, {
    ...init,
    // Cookies only to borrow the website's session; otherwise the tokens are
    // the whole session.
    credentials: withCookies ? "include" : "omit",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
}

async function fail(res: Response): Promise<never> {
  const body = await res.json().catch(() => null);
  throw new ApiError(
    res.status,
    body?.detail,
    res.status === 429 ? retryAfterSeconds(res.headers) : undefined,
  );
}

let refreshing: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  refreshing ??= (async () => {
    const refresh = await local.get<string>(REFRESH);
    const borrowed = !refresh && (await local.get<string>(MODE)) === "browser";
    if (!refresh && !borrowed) throw new SignedOutError();
    const res = await send(
      "/v1/auth/refresh",
      refresh
        ? { method: "POST", body: JSON.stringify({ refresh_token: refresh }) }
        : { method: "POST" },
      undefined,
      borrowed,
    ).catch(() => {
      // Offline or the API is down: keep the session, just fail this call.
      throw new ApiError(0);
    });
    if (!res.ok) {
      // Only a rejected token ends the session; a server error doesn't.
      if (res.status >= 400 && res.status < 500 && res.status !== 429) {
        await clearSession();
        throw new SignedOutError();
      }
      return fail(res);
    }
    const tokens = (await res.json()) as TokenPair;
    if (borrowed) {
      // The website's refresh token is never kept: only the short-lived access
      // token, and the cookie stays the source of the session.
      await session.set(ACCESS, tokens.access_token);
      await session.set(VERIFIED, Date.now());
    } else {
      await saveTokens(tokens);
    }
    return tokens.access_token;
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

// The token to use now. For a borrowed website session this re-checks the
// website's cookie once the last check is a minute old, so signing out of the
// website signs the extension out within a minute (the popup checks every time
// it opens).
async function currentToken(): Promise<string> {
  const cached = await session.get<string>(ACCESS);
  if (!cached) return refreshAccessToken();
  if (await usesBrowserSession()) {
    const verified = await session.get<number>(VERIFIED);
    if (!verified || Date.now() - verified > VERIFY_TTL_MS) {
      return refreshAccessToken();
    }
  }
  return cached;
}

// Confirms a borrowed website session is still there. Throws SignedOutError (and
// forgets the session) if the website has signed out. Does nothing for the
// extension's own sign-in, which doesn't depend on the website.
export async function revalidateSession(): Promise<void> {
  if (await usesBrowserSession()) await refreshAccessToken();
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let token = await currentToken();
  let res = await send(path, init, token).catch(() => {
    throw new ApiError(0);
  });
  if (res.status === 401) {
    token = await refreshAccessToken();
    res = await send(path, init, token).catch(() => {
      throw new ApiError(0);
    });
  }
  if (!res.ok) return fail(res);
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) });

export async function login(
  email: string,
  password: string,
): Promise<StoredUser> {
  const res = await send("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }).catch(() => {
    throw new ApiError(0);
  });
  if (!res.ok) return fail(res);
  const data = (await res.json()) as {
    user: StoredUser;
    tokens: TokenPair;
  };
  await saveTokens(data.tokens);
  const user = { email: data.user.email, full_name: data.user.full_name };
  await local.set(USER, user);
  return user;
}

// Used when the web app hands over a session (social sign-in): the refresh
// token is traded for the extension's own pair straight away, which also proves
// it's real. Guests are refused, since the extension is part of Pro.
export class GuestAccountError extends Error {
  constructor() {
    super("Guest accounts can't use the extension.");
  }
}

export async function connectWithRefreshToken(
  refreshToken: string,
): Promise<StoredUser> {
  await clearSession();
  await local.set(REFRESH, refreshToken);
  await refreshAccessToken();
  const me = await request<StoredUser & { is_anonymous?: boolean }>(
    "/v1/users/me",
  );
  if (me.is_anonymous) {
    await clearSession();
    throw new GuestAccountError();
  }
  const user = { email: me.email, full_name: me.full_name };
  await local.set(USER, user);
  return user;
}

// If the person is signed in on the Refresha website, borrow that session.
// Returns who they are, or null when there's nothing to borrow (not signed in
// there, or only a guest). Anything else (offline, a server error) is thrown
// and leaves nothing behind.
export async function adoptBrowserSession(): Promise<StoredUser | null> {
  await local.set(MODE, "browser");
  try {
    await refreshAccessToken();
    const me = await request<StoredUser & { is_anonymous?: boolean }>(
      "/v1/users/me",
    );
    if (me.is_anonymous) {
      await clearSession();
      return null;
    }
    const user = { email: me.email, full_name: me.full_name };
    await local.set(USER, user);
    return user;
  } catch (error) {
    if (error instanceof SignedOutError) return null;
    await clearSession();
    throw error;
  }
}

export async function signOut() {
  await clearSession();
}

// --- plan -------------------------------------------------------------------

// The extension is part of Pro. This asks the API which plan the account is on
// (cached for a few minutes so a burst of actions makes one call).
export async function getEntitlements(force = false): Promise<Entitlements> {
  if (!force) {
    const cached = await session.get<{ at: number; value: Entitlements }>(PLAN);
    if (cached && Date.now() - cached.at < PLAN_TTL_MS) return cached.value;
  }
  const value = await request<Entitlements>("/v1/billing/entitlements");
  await session.set(PLAN, { at: Date.now(), value });
  return value;
}

export const isPro = (plan: Entitlements) => plan.plan_code === "pro";

// Thrown by anything the extension does for you when the account isn't on Pro.
export class ProRequiredError extends Error {
  constructor() {
    super("The Refresha extension is part of Pro.");
  }
}

export async function requirePro(): Promise<void> {
  if (!isPro(await getEntitlements())) throw new ProRequiredError();
}

// --- applications -----------------------------------------------------------

const PAGE = 100;
const MAX_ROWS = 1000;

export async function listApplications(): Promise<ApplicationSummary[]> {
  const items: ApplicationSummary[] = [];
  let total = 0;
  do {
    const page = await request<{ items: ApplicationSummary[]; total: number }>(
      `/v1/applications?limit=${PAGE}&offset=${items.length}`,
    );
    items.push(...page.items);
    total = page.total;
    if (page.items.length === 0) break;
  } while (items.length < total && items.length < MAX_ROWS);
  return items;
}

export type NewApplication = {
  company_name: string;
  title: string;
  location: string;
  source_url: string;
  status: "saved" | "applied";
  applied_at?: string;
  notes?: string;
  tier: number;
};

export const createApplication = (data: NewApplication) =>
  post<ApplicationSummary>("/v1/applications", data);

export const markApplied = (id: string) =>
  post<ApplicationSummary>(`/v1/applications/${id}/status`, {
    to_status: "applied",
    occurred_at: new Date().toISOString(),
  });

export const deleteApplication = (id: string) =>
  request<void>(`/v1/applications/${id}`, { method: "DELETE" });

// Reads a job posting with Refresha's AI. Part of Pro, like the rest.
export const parseText = (text: string) =>
  post<{
    company_name?: string | null;
    title?: string | null;
    location?: string | null;
  }>("/v1/applications/parse/text", { text });
