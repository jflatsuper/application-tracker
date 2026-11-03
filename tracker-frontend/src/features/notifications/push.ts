import { notificationApi } from "./api/notificationApi";

export type PushState = "unsupported" | "blocked" | "off" | "on";

const SW_URL = "/sw.js";

export const pushSupported = () =>
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

const registration = () => navigator.serviceWorker.register(SW_URL);

// The key arrives base64url encoded; subscribe() wants raw bytes.
function keyBytes(key: string): Uint8Array<ArrayBuffer> {
  const padded = key.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    Math.ceil(key.length / 4) * 4,
    "=",
  );
  const raw = atob(padded);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

const sameKey = (current: ArrayBuffer | null, wanted: Uint8Array) =>
  current !== null &&
  new Uint8Array(current).length === wanted.length &&
  new Uint8Array(current).every((byte, i) => byte === wanted[i]);

// Only the two fields the API needs, not the rest of toJSON().
function toBody(subscription: PushSubscription) {
  const { endpoint, keys } = subscription.toJSON();
  if (!endpoint || !keys?.p256dh || !keys.auth) {
    throw new Error("The browser gave an incomplete push subscription.");
  }
  return { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } };
}

export async function readPushState(): Promise<PushState> {
  if (!pushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "blocked";
  if (Notification.permission !== "granted") return "off";
  const current = await navigator.serviceWorker.getRegistration(SW_URL);
  return (await current?.pushManager.getSubscription()) ? "on" : "off";
}

// Must run from a click: browsers only show the permission prompt for one.
export async function enablePush() {
  if (!pushSupported()) throw new Error("This browser can't receive push notifications.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notifications were not allowed for this site.");
  }

  const [{ public_key }, reg] = await Promise.all([
    notificationApi.pushPublicKey(),
    registration(),
  ]);
  await navigator.serviceWorker.ready;

  const wanted = keyBytes(public_key);
  let subscription = await reg.pushManager.getSubscription();
  // After a key rotation the old subscription can't be used any more.
  if (subscription && !sameKey(subscription.options.applicationServerKey, wanted)) {
    await subscription.unsubscribe();
    subscription = null;
  }
  subscription ??= await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: wanted,
  });

  await notificationApi.pushSubscribe(toBody(subscription));
}

// The API has no unsubscribe call, so this only stops the browser listening.
// The server drops the stale endpoint when the push service reports it gone.
export async function disablePush() {
  const current = await navigator.serviceWorker.getRegistration(SW_URL);
  await (await current?.pushManager.getSubscription())?.unsubscribe();
}

// Subscriptions belong to the browser but the server row belongs to a user, so
// tell the server about this browser again each time someone is signed in.
export async function resyncPush() {
  if (!pushSupported() || Notification.permission !== "granted") return;
  const reg = await registration();
  const subscription = await reg.pushManager.getSubscription();
  if (subscription) await notificationApi.pushSubscribe(toBody(subscription));
}
