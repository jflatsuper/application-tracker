import {
  ApiError,
  GuestAccountError,
  SignedOutError,
  connectWithRefreshToken,
  ProRequiredError,
  deleteApplication,
  getEntitlements,
  hasSession,
  isPro,
} from "../shared/api";
import { APP_URL, appLink } from "../shared/config";
import { SITE_PATTERNS, isWatchedUrl } from "../shared/sites";
import { local, session } from "../shared/storage";
import { trackJob } from "../shared/tracking";
import type { JobDraft } from "../shared/types";

const AUTO_ADD = "autoAdd";
const SCRIPT_ID = "refresha-watch";
const ICON = "icons/icon-128.png";
const NEEDS_REVIEW_TITLE = "Job to review";

// --- the watcher script -------------------------------------------------------

// The watcher is registered only while automatic adding is on, the account is
// on Pro and the person has granted access to the job sites. Otherwise nothing
// of ours runs on those pages at all.
async function syncWatcher() {
  const registered = await chrome.scripting.getRegisteredContentScripts({
    ids: [SCRIPT_ID],
  });
  const remove = () =>
    registered.length
      ? chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] })
      : Promise.resolve();

  const wanted = await local.get<boolean>(AUTO_ADD);
  let allowed = false;
  let granted = false;
  if (wanted && (await hasSession())) {
    try {
      allowed = isPro(await getEntitlements());
    } catch {
      // Can't tell right now (offline): leave things as they are.
      return;
    }
    granted = await chrome.permissions.contains({ origins: SITE_PATTERNS });
  }

  if (!wanted || !allowed || !granted) {
    await remove();
    return;
  }
  if (registered.length) return;
  await chrome.scripting.registerContentScripts([
    {
      id: SCRIPT_ID,
      js: ["watch.js"],
      matches: SITE_PATTERNS,
      runAt: "document_idle",
      persistAcrossSessions: true,
    },
  ]);
}

chrome.runtime.onInstalled.addListener(() => void syncWatcher());
chrome.runtime.onStartup.addListener(() => void syncWatcher());

// --- notifications -------------------------------------------------------------

const NOTES = "notificationTargets";
type Target = { id: string; canUndo: boolean };

async function rememberTarget(notificationId: string, target: Target) {
  const all = (await session.get<Record<string, Target>>(NOTES)) ?? {};
  all[notificationId] = target;
  await session.set(NOTES, all);
}

async function notify(
  title: string,
  message: string,
  target?: Target & { buttons?: string[] },
) {
  const id = `refresha-${Date.now()}`;
  if (target) await rememberTarget(id, target);
  chrome.notifications.create(id, {
    type: "basic",
    iconUrl: ICON,
    title,
    message,
    buttons: target?.buttons?.map((label) => ({ title: label })),
  });
}

chrome.notifications.onButtonClicked.addListener(async (id, button) => {
  const target = ((await session.get<Record<string, Target>>(NOTES)) ?? {})[id];
  if (!target) return;
  if (target.canUndo && button === 0) {
    try {
      await deleteApplication(target.id);
      chrome.notifications.create(`${id}-undone`, {
        type: "basic",
        iconUrl: ICON,
        title: "Removed from Refresha",
        message: "That application was taken out again.",
      });
    } catch {
      chrome.notifications.create(`${id}-failed`, {
        type: "basic",
        iconUrl: ICON,
        title: "Couldn't undo",
        message: "Open Refresha to remove it yourself.",
      });
    }
  } else {
    await chrome.tabs.create({ url: appLink(`/applications/${target.id}`) });
  }
  chrome.notifications.clear(id);
});

chrome.notifications.onClicked.addListener(async (id) => {
  const target = ((await session.get<Record<string, Target>>(NOTES)) ?? {})[id];
  await chrome.tabs.create({
    url: target
      ? appLink(`/applications/${target.id}`)
      : appLink("/applications"),
  });
  chrome.notifications.clear(id);
});

// --- a finished application -----------------------------------------------------

async function handleSubmitted(job: JobDraft) {
  if (!(await hasSession())) {
    await notify(
      "Sign in to Refresha",
      "You applied, but the extension isn't signed in, so it didn't add the job.",
    );
    return;
  }

  // The confirmation page doesn't always name the role. Add what we know and
  // flag it, rather than dropping the application.
  const incomplete = !job.title || !job.company;
  const draft: JobDraft = {
    ...job,
    title: job.title || NEEDS_REVIEW_TITLE,
    company: job.company || "Unknown company",
  };

  try {
    const result = await trackJob(draft, "applied", {
      needsReview: incomplete,
    });
    const what = `${draft.title} at ${draft.company}`;
    if (result.kind === "created") {
      await notify(
        "Added to Refresha",
        incomplete ? `${what}. Check the details.` : what,
        { id: result.application.id, canUndo: true, buttons: ["Undo", "Open"] },
      );
    } else if (result.kind === "updated") {
      await notify("Marked as applied", what, {
        id: result.application.id,
        canUndo: false,
        buttons: ["Open"],
      });
    } else {
      await notify("Already in Refresha", what, {
        id: result.application.id,
        canUndo: false,
        buttons: ["Open"],
      });
    }
  } catch (error) {
    if (error instanceof ProRequiredError) {
      await syncWatcher();
      await notify(
        "Automatic adding is part of Pro",
        "Upgrade to have applications added for you.",
      );
    } else if (error instanceof SignedOutError) {
      await notify("Sign in to Refresha", "The extension was signed out.");
    } else if (error instanceof ApiError && error.status === 429) {
      await notify(
        "Too many requests",
        "Refresha asked us to slow down. Add it by hand.",
      );
    } else {
      await notify("Couldn't add the job", "Open Refresha and add it by hand.");
    }
  }
}

// --- messages --------------------------------------------------------------------

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Only our own scripts, and only from a job site we watch.
  if (sender.id !== chrome.runtime.id) return;

  if (message?.type === "application-submitted") {
    if (!isWatchedUrl(sender.url ?? sender.tab?.url)) return;
    const job = message.job as Partial<JobDraft> | undefined;
    if (!job || typeof job !== "object") return;
    void handleSubmitted({
      title: String(job.title ?? "").slice(0, 255),
      company: String(job.company ?? "").slice(0, 255),
      location: String(job.location ?? "").slice(0, 255),
      url: String(job.url ?? "").slice(0, 2048),
    });
    return;
  }

  if (message?.type === "sync-watcher") {
    syncWatcher().then(() => sendResponse({ ok: true }));
    return true; // answer asynchronously
  }
});

// --- connecting from the web app -----------------------------------------------

// The website's "Connect the extension" page hands over a session so people can
// sign in with Google or LinkedIn. Chrome only delivers these from pages the
// manifest allows (externally_connectable), and we check the origin again: it
// must be exactly the Refresha web app.
const APP_ORIGIN = new URL(APP_URL).origin;

chrome.runtime.onMessageExternal.addListener(
  (message, sender, sendResponse) => {
    if (sender.origin !== APP_ORIGIN) return;
    if (message?.type !== "connect") return;
    const token = message.refresh_token;
    if (typeof token !== "string" || token.length < 20 || token.length > 4096) {
      sendResponse({ ok: false, error: "invalid" });
      return;
    }
    connectWithRefreshToken(token)
      .then(() => syncWatcher())
      .then(() => sendResponse({ ok: true }))
      .catch((error) =>
        sendResponse({
          ok: false,
          error: error instanceof GuestAccountError ? "guest" : "rejected",
        }),
      );
    return true; // answer asynchronously
  },
);
