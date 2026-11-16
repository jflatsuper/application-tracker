import { extractJob } from "../shared/extractJob";
import { isSubmitted } from "../shared/submitted";
import type { JobDraft } from "../shared/types";

// Runs only on job sites the person allowed, and only when automatic adding is
// on. It remembers the posting you're looking at (in this tab only) and, when a
// page says your application went through, tells the background worker.
// Nothing is sent anywhere before that moment.

const SEEN = "refresha.job";
const SENT = "refresha.sent";
const CHECK_DELAY_MS = 600;

const read = <T,>(key: string): T | null => {
  try {
    return JSON.parse(sessionStorage.getItem(key) ?? "null");
  } catch {
    return null;
  }
};
const write = (key: string, value: unknown) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage blocked: we just can't remember across pages.
  }
};

const pageText = () => (document.body?.innerText ?? "").slice(0, 6000);

function check() {
  const url = location.href;
  const remembered = read<JobDraft>(SEEN);

  if (!isSubmitted(url, pageText(), remembered !== null)) {
    // An ordinary page: if it's a posting, remember it for later.
    const job = extractJob(document, url);
    if (job.title && job.company) write(SEEN, job);
    return;
  }

  // The confirmation page rarely names the job, so use what we remembered,
  // topped up with whatever this page can tell us.
  const here = extractJob(document, url);
  const job: JobDraft = {
    title: remembered?.title || "",
    company: remembered?.company || here.company,
    location: remembered?.location || "",
    url: remembered?.url || url,
  };

  const key = `${job.company}|${job.title}|${job.url}`;
  if (read<string>(SENT) === key) return;
  write(SENT, key);

  chrome.runtime.sendMessage({ type: "application-submitted", job }).catch(() => {
    // The worker was asleep and the message failed: nothing to do about it.
  });
}

let timer: number | undefined;
const schedule = () => {
  window.clearTimeout(timer);
  timer = window.setTimeout(check, CHECK_DELAY_MS);
};

schedule();
// Single-page job boards show the confirmation without loading a new page.
new MutationObserver(schedule).observe(document.documentElement, {
  childList: true,
  subtree: true,
});
