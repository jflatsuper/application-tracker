// Emailed links carry their token in the fragment (/reset-password#token=…),
// which browsers never send to a server or put in its logs. A ?token= query is
// still accepted so older links keep working.
const MIN_TOKEN = 20;
const MAX_TOKEN = 128;

// The API only accepts tokens of a set length, so anything else is a broken link.
export const looksLikeToken = (token: string | null): token is string =>
  !!token && token.length >= MIN_TOKEN && token.length <= MAX_TOKEN;

export function readLinkToken(location: { hash: string; search: string }) {
  const fromHash = new URLSearchParams(location.hash.replace(/^#/, "")).get(
    "token",
  );
  return fromHash || new URLSearchParams(location.search).get("token");
}
