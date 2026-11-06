import { SITE_GROUPS, SITE_PATTERNS } from "../../scripts/sites.mjs";

export { SITE_GROUPS, SITE_PATTERNS };

// "boards.greenhouse.io" and friends: is this page one we may watch?
export function isWatchedUrl(url: string | undefined): boolean {
  if (!url) return false;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  return SITE_PATTERNS.some((pattern) => {
    const host = new URL(pattern.replace("/*", "/")).host;
    return parsed.protocol === "https:" && parsed.host === host;
  });
}

// The company's name as it appears in the address of the big job-board hosts:
// jobs.lever.co/acme-corp/... -> "Acme Corp".
export function companyFromUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "";
  }
  if (!isWatchedUrl(url)) return "";
  const slug = parsed.pathname.split("/").filter(Boolean)[0];
  if (!slug) return "";
  return decodeURIComponent(slug)
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
