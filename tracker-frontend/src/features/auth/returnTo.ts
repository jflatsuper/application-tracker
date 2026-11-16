// Signing in with Google or LinkedIn leaves the site and comes back to
// /auth/complete, so the page someone was heading to has to be remembered
// across that trip. Only paths inside this site are ever followed.
const KEY = "auth.returnTo";

const isInternalPath = (value: unknown): value is string =>
  typeof value === "string" &&
  value.startsWith("/") &&
  !value.startsWith("//") &&
  !value.includes("\\");

export function rememberReturnTo(path: string | undefined) {
  if (!isInternalPath(path)) return;
  try {
    sessionStorage.setItem(KEY, path);
  } catch {
    // Storage blocked: they just land on the home page afterwards.
  }
}

// Reads and forgets it, so it only ever applies to one sign-in.
export function takeReturnTo(): string | null {
  try {
    const path = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return isInternalPath(path) ? path : null;
  } catch {
    return null;
  }
}
