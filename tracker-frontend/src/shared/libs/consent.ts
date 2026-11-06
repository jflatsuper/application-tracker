import { useSyncExternalStore } from "react";
import { COOKIE_CATEGORIES, type CategoryId } from "@/constants/cookies";

// The visitor's answers about each kind of non-essential cookie, kept in this
// browser only. Bump VERSION after a material privacy-policy change to ask
// everyone again. A category added later is asked about on its own; the
// answers already given are kept.
const KEY = "cookie_consent";
const VERSION = 2;
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

type Choices = Partial<Record<CategoryId, boolean>>;

type State = {
  // Only the categories the visitor has answered.
  choices: Choices;
  // True while the settings dialog is open.
  settingsOpen: boolean;
};

function readSaved(): Choices {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (!saved || !(Date.now() - saved.savedAt < MAX_AGE_MS)) return {};
    // Version 1 only knew about analytics: { analytics: "granted" | "denied" }.
    if (saved.version === 1) {
      return saved.analytics === "granted" || saved.analytics === "denied"
        ? { analytics: saved.analytics === "granted" }
        : {};
    }
    if (saved.version !== VERSION || typeof saved.choices !== "object")
      return {};
    const choices: Choices = {};
    for (const { id } of COOKIE_CATEGORIES) {
      if (typeof saved.choices?.[id] === "boolean")
        choices[id] = saved.choices[id];
    }
    return choices;
  } catch {
    return {};
  }
}

function save(choices: Choices) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ version: VERSION, savedAt: Date.now(), choices }),
    );
  } catch {
    // Storage can be blocked. The answers then last until the page closes.
  }
}

let state: State = { choices: readSaved(), settingsOpen: false };
const listeners = new Set<() => void>();

function update(next: State) {
  state = next;
  listeners.forEach((listener) => listener());
}

export const isAllowed = (id: CategoryId) => state.choices[id] === true;

export const subscribeConsent = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// Categories with no answer yet: the reason the banner shows.
export const pendingCategories = (choices: Choices) =>
  COOKIE_CATEGORIES.filter(({ id }) => choices[id] === undefined);

// Answers the unanswered categories all one way (the banner's two buttons).
// Earlier answers stay as they were.
export function answerPending(allowed: boolean) {
  const choices = { ...state.choices };
  for (const { id } of pendingCategories(choices)) choices[id] = allowed;
  save(choices);
  update({ choices, settingsOpen: false });
}

// Saves exactly what the dialog shows.
export function saveChoices(choices: Choices) {
  save(choices);
  update({ choices, settingsOpen: false });
}

export const openCookieSettings = () =>
  update({ ...state, settingsOpen: true });

export const closeCookieSettings = () => {
  if (state.settingsOpen) update({ ...state, settingsOpen: false });
};

export const useConsentState = () =>
  useSyncExternalStore(subscribeConsent, () => state);
