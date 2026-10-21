export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let accessToken: string | null = null;
let onAuthFailure: (() => void) | null = null;

export const setAuthFailureHandler = (fn: (() => void) | null) => {
  onAuthFailure = fn;
};

let refreshPromise: Promise<string | null> | null = null;

const SESSION_HINT = "has_session";
export const hasSessionHint = () => localStorage.getItem(SESSION_HINT) === "1";
export const markSessionHint = () => localStorage.setItem(SESSION_HINT, "1");

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) markSessionHint();
  else localStorage.removeItem(SESSION_HINT);
}

export function refreshAccessToken(): Promise<string | null> {
  refreshPromise ??= (async () => {
    const res = await fetch(`${BASE_URL}/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    }).catch(() => null);

    if (!res?.ok) {
      if (res && res.status < 500) setAccessToken(null);
      return null;
    }
    const { access_token } = await res.json();
    setAccessToken(access_token);
    return access_token as string;
  })().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}
export const logout = async (): Promise<void> => {
  await fetch(`${BASE_URL}/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => {
    console.log("logout failed");
  });
};

async function request<T>(
  path: string,
  options?: RequestInit,
  canRetry = true,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options?.headers,
    },
  });

  if (res.status === 401 && canRetry && !path.startsWith("/v1/auth/")) {
    if (await refreshAccessToken()) return request<T>(path, options, false);
    onAuthFailure?.();
  }

  if (!res.ok) throw new ApiError(res.status, `Request failed: ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path: string) => request<void>(path, { method: "DELETE" }),
};
