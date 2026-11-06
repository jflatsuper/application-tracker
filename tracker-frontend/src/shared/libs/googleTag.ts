import { GOOGLE_TAG_ID } from "@/constants/site";
import { isAllowed, subscribeConsent } from "./consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

let loaded = false;

// gtag.js reads the `arguments` object itself, so a rest-parameter array
// won't do here.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function gtag(..._args: unknown[]) {
  // eslint-disable-next-line prefer-rest-params
  (window.dataLayer ??= []).push(arguments);
}

// Google's own switch: while it is true the tag sends nothing.
const setDisabled = (disabled: boolean) => {
  (window as unknown as Record<string, boolean>)[
    `ga-disable-${GOOGLE_TAG_ID}`
  ] = disabled;
};

function load() {
  if (loaded) return;
  loaded = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GOOGLE_TAG_ID!)}`;
  document.head.appendChild(script);

  gtag("js", new Date());
  // Page views are sent by hand (see trackPageView): the tag can't see
  // client-side route changes, and sending the path ourselves keeps query
  // strings and #token fragments out of Google.
  gtag("config", GOOGLE_TAG_ID, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
}

// Google's script won't remove its cookies, so on withdrawal we do. They sit on
// the site's parent domain, so try each level of the host name.
function deleteGoogleCookies() {
  const names = document.cookie
    .split(";")
    .map((part) => part.split("=")[0].trim())
    .filter((name) => name === "_ga" || name.startsWith("_ga_"));
  const parts = location.hostname.split(".");
  const domains = parts.map((_, i) => parts.slice(i).join("."));
  for (const name of names) {
    for (const domain of [undefined, ...domains]) {
      const scope = domain ? `; domain=${domain}` : "";
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${scope}`;
    }
  }
}

// Makes the tag match the visitor's answer: nothing from Google is requested
// until they accept, and a later "decline" switches it off again.
function sync() {
  if (!GOOGLE_TAG_ID) return;
  if (isAllowed("analytics")) {
    setDisabled(false);
    load();
  } else if (loaded) {
    setDisabled(true);
    deleteGoogleCookies();
  }
}

export function initGoogleTag() {
  if (!GOOGLE_TAG_ID) return;
  sync();
  subscribeConsent(sync);
}

export function trackPageView(path: string) {
  if (!GOOGLE_TAG_ID || !loaded || !isAllowed("analytics")) return;
  gtag("event", "page_view", {
    page_path: path,
    page_location: `${window.location.origin}${path}`,
    page_title: document.title,
  });
}
