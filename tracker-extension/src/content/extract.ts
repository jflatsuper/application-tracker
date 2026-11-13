import { extractJob } from "../shared/extractJob";

// Injected by the popup when you click the icon: reads this page and leaves the
// result where the popup can fetch it. Nothing leaves the page from here.
const TEXT_LIMIT = 20000;

(
  window as unknown as { __refreshaPage?: unknown }
).__refreshaPage = {
  job: extractJob(document, location.href),
  text: (document.body?.innerText ?? "").slice(0, TEXT_LIMIT),
};
