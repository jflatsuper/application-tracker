import type { Notification } from "./types";

// Sorts a freshly loaded feed into what to announce. The first load only
// records what is already there, so old unread items aren't announced again
// on every page load; after that, an unread item not seen before is new.
export function findNew(
  seen: Set<string> | null,
  items: Notification[],
): { seen: Set<string>; fresh: Notification[] } {
  if (seen === null) return { seen: new Set(items.map((i) => i.id)), fresh: [] };
  const fresh = items.filter((item) => !seen.has(item.id) && !item.read_at);
  return { seen: new Set([...seen, ...items.map((i) => i.id)]), fresh };
}
