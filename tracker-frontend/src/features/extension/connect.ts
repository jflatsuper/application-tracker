import { EXTENSION_IDS } from "@/constants/site";

type Reply = { ok: boolean; error?: string } | undefined;

type ChromeRuntime = {
  sendMessage: (
    id: string,
    message: unknown,
    callback: (reply: Reply) => void,
  ) => void;
  lastError?: { message?: string };
};

const runtime = (): ChromeRuntime | undefined =>
  (window as unknown as { chrome?: { runtime?: ChromeRuntime } }).chrome
    ?.runtime;

export class ConnectError extends Error {
  reason: "unsupported" | "unreachable" | "guest" | "rejected";
  constructor(reason: ConnectError["reason"]) {
    super(reason);
    this.reason = reason;
  }
}

export const extensionAvailable = () => EXTENSION_IDS.length > 0;

// Chrome can only message an extension that has allowed this site, so a browser
// without one (or Firefox, Safari) has no runtime.sendMessage at all.
export const browserCanConnect = () =>
  typeof runtime()?.sendMessage === "function";

function sendTo(id: string, refreshToken: string): Promise<Reply> {
  return new Promise((resolve, reject) => {
    const api = runtime();
    if (!api?.sendMessage) return reject(new ConnectError("unsupported"));
    api.sendMessage(
      id,
      { type: "connect", refresh_token: refreshToken },
      (reply) => {
        // "Could not establish connection": that ID isn't installed here.
        if (api.lastError) return reject(new ConnectError("unreachable"));
        resolve(reply);
      },
    );
  });
}

// Offers the session to each known extension ID until one takes it.
export async function connectExtension(refreshToken: string): Promise<void> {
  let failure: ConnectError = new ConnectError("unreachable");
  for (const id of EXTENSION_IDS) {
    try {
      const reply = await sendTo(id, refreshToken);
      if (reply?.ok) return;
      failure = new ConnectError(
        reply?.error === "guest" ? "guest" : "rejected",
      );
    } catch (error) {
      if (error instanceof ConnectError) failure = error;
    }
  }
  throw failure;
}
