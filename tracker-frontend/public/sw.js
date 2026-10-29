// Receives Web Push for Refresha. A push only says "something changed", so
// it is shown as a short notification; the app itself fetches the details
// when it is opened.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

const DEFAULT = {
  title: "Refresha",
  body: "You have a new notification.",
  url: "/",
  tag: undefined,
};

function readPayload(raw) {
  if (!raw) return DEFAULT;
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ...DEFAULT, body: raw };
  }
  const text = (value) =>
    typeof value === "string" && value.trim() ? value : undefined;
  return {
    title: text(data?.title) ?? DEFAULT.title,
    body: text(data?.body) ?? text(data?.message) ?? DEFAULT.body,
    url: sitePath(text(data?.url)),
    tag: text(data?.tag),
  };
}

// The API sends a full address, so reduce it to a path on this site. A link to
// anywhere else falls back to the home page.
function sitePath(value) {
  if (!value) return DEFAULT.url;
  try {
    const url = new URL(value, self.location.origin);
    return url.origin === self.location.origin
      ? url.pathname + url.search + url.hash
      : DEFAULT.url;
  } catch {
    return DEFAULT.url;
  }
}

self.addEventListener("push", (event) => {
  const { title, body, url, tag } = readPayload(
    event.data ? event.data.text() : "",
  );

  event.waitUntil(
    (async () => {
      // Open tabs refresh themselves straight away...
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      windows.forEach((w) => w.postMessage({ type: "nudge" }));

      // ...and the notification is always shown too, so a push is never
      // silent. The tag lets a newer one of the same kind replace an older.
      await self.registration.showNotification(title, {
        body,
        tag,
        data: { url },
      });
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? DEFAULT.url;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const existing = windows[0];
      if (existing) {
        await existing.focus();
        if ("navigate" in existing) await existing.navigate(url).catch(() => {});
        return;
      }
      await self.clients.openWindow(url);
    })(),
  );
});
