// A 429 says how long to wait in Retry-After: whole seconds, or an HTTP date.
// Returns seconds from now, or undefined when the header is missing, unreadable
// (cross-origin responses hide it unless the server exposes it) or already past.
export function parseRetryAfter(
  headers: Headers,
  now = Date.now(),
): number | undefined {
  const value = headers.get("Retry-After")?.trim();
  if (!value) return undefined;

  if (/^\d+$/.test(value)) return Number(value);

  const date = Date.parse(value);
  if (Number.isNaN(date)) return undefined;
  const seconds = Math.ceil((date - now) / 1000);
  return seconds > 0 ? seconds : undefined;
}

// "30 seconds", "1 minute", "2 minutes", "1 hour".
export function formatWait(seconds: number): string {
  const plural = (n: number, unit: string) =>
    `${n} ${unit}${n === 1 ? "" : "s"}`;
  if (seconds < 60) return plural(Math.max(1, Math.ceil(seconds)), "second");
  if (seconds < 3600) return plural(Math.ceil(seconds / 60), "minute");
  return plural(Math.ceil(seconds / 3600), "hour");
}

// "Try again in 30 seconds." or, with no usable header, the fallback wording.
export function retryHint(
  seconds: number | undefined,
  fallback: string,
): string {
  return seconds === undefined
    ? fallback
    : `Try again in ${formatWait(seconds)}.`;
}
