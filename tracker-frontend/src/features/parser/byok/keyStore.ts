export type KeyLocation = "session" | "device";

// Keys are stored per user so a shared browser never hands one person's
// key to another. Without "remember", the key lives only until the tab closes.
const storageKey = (userId: string) => `refresha.anthropic-key.${userId}`;

export function readKey(
  userId: string,
): { key: string; location: KeyLocation } | null {
  try {
    const session = sessionStorage.getItem(storageKey(userId));
    if (session) return { key: session, location: "session" };
    const device = localStorage.getItem(storageKey(userId));
    if (device) return { key: device, location: "device" };
  } catch {
    // Storage blocked: behave as if no key is saved.
  }
  return null;
}

export function clearKey(userId: string) {
  try {
    sessionStorage.removeItem(storageKey(userId));
    localStorage.removeItem(storageKey(userId));
  } catch {
    // Nothing to clear if storage is blocked.
  }
}

export function saveKey(userId: string, key: string, remember: boolean) {
  clearKey(userId);
  try {
    (remember ? localStorage : sessionStorage).setItem(storageKey(userId), key);
  } catch {
    throw new Error("Couldn't store the key in this browser.");
  }
}

export const looksLikeAnthropicKey = (key: string) =>
  /^sk-ant-[\w-]{10,}$/.test(key.trim());

export const lastFour = (key: string) => key.slice(-4);
