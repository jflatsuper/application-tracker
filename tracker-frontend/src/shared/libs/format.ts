const options: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};
const localFormat = new Intl.DateTimeFormat("en-GB", options);
const utcFormat = new Intl.DateTimeFormat("en-GB", {
  ...options,
  timeZone: "UTC",
});

// Date-only values and dates stored at noon UTC must be read in UTC,
// or they show as the wrong day in some timezones.
export function formatDate(
  value: string | null | undefined,
  { utc = false }: { utc?: boolean } = {},
): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return (utc ? utcFormat : localFormat).format(date);
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

// "5 minutes ago" for recent timestamps, a plain date once it's over a week old.
export function timeAgo(value: string, now = Date.now()): string {
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";
  const diff = then - now;
  if (Math.abs(diff) > 7 * 86_400_000) return formatDate(value) ?? "";
  for (const [unit, ms] of UNITS) {
    if (Math.abs(diff) >= ms) return relative.format(Math.round(diff / ms), unit);
  }
  return "just now";
}
