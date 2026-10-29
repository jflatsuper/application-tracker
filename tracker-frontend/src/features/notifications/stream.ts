import {
  BASE_URL,
  getAccessToken,
  refreshAccessToken,
} from "@/shared/libs/apiClient";

const STREAM_URL = `${BASE_URL}/v1/notifications/stream`;
const MIN_DELAY = 1_000;
const MAX_DELAY = 30_000;

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });

// Reads the server-sent events stream with fetch, because EventSource can't
// send the Authorization header the endpoint requires. The events only say
// "something changed", so every one (and every reconnect, which may have
// missed some) is reported as a single nudge to refetch.
export async function listenForNudges(onNudge: () => void, signal: AbortSignal) {
  let delay = MIN_DELAY;

  while (!signal.aborted) {
    try {
      const token = getAccessToken();
      const res = await fetch(STREAM_URL, {
        signal,
        headers: {
          Accept: "text/event-stream",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.status === 401) {
        // Signed out for good: the API client's auth handler takes over.
        if (!(await refreshAccessToken())) return;
        continue;
      }
      if (!res.ok || !res.body) throw new Error(`Stream failed: ${res.status}`);

      delay = MIN_DELAY;
      onNudge();

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += value;
        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() ?? "";
        // Blocks made only of ":" comment lines are keep-alives.
        if (events.some((block) => /^(?!:)\S/m.test(block))) onNudge();
      }
    } catch {
      if (signal.aborted) return;
    }

    await wait(delay, signal);
    delay = Math.min(delay * 2, MAX_DELAY);
  }
}
