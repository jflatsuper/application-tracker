import type { Notification, NotificationType } from "./types";

export type Tone = "danger" | "warning" | "info" | "success";

interface Wording {
  title: string;
  body: string;
  to?: string;
  tone: Tone;
}

const DEFAULTS: Record<NotificationType, Wording> = {
  announcement: { title: "New announcement", body: "", tone: "info" },
  payment_failed: {
    title: "Payment failed",
    body: "We couldn't take your last payment. Update your payment method to keep your plan.",
    to: "/profile/billing",
    tone: "danger",
  },
  subscription_canceled: {
    title: "Subscription canceled",
    body: "Your plan will end at the close of the billing period.",
    to: "/profile/billing",
    tone: "warning",
  },
  trial_ending: {
    title: "Your trial is ending soon",
    body: "Choose a plan to keep your paid features.",
    to: "/pricing",
    tone: "warning",
  },
  parse_complete: {
    title: "Posting parsed",
    body: "Your job posting is ready to review.",
    to: "/applications/create",
    tone: "success",
  },
};

const text = (value: unknown) =>
  typeof value === "string" && value.trim() ? value : undefined;

// The payload shape isn't documented, so a title or message it carries wins
// over the default wording for its type.
export function describeNotification({ type, payload }: Notification): Wording {
  const base = DEFAULTS[type] ?? { title: "Notification", body: "", tone: "info" };
  return {
    title: text(payload.title) ?? base.title,
    body: text(payload.message) ?? text(payload.body) ?? base.body,
    to: base.to,
    tone: base.tone,
  };
}

// Icons for the feed and toasts, by tone.
export const TONE_ICONS = {
  danger: "alert-circle",
  warning: "alert-triangle",
  info: "info",
  success: "check",
} as const satisfies Record<Tone, string>;
