import type { Notification, NotificationType } from "./types";

interface Wording {
  title: string;
  body: string;
  to?: string;
}

const DEFAULTS: Record<NotificationType, Wording> = {
  announcement: { title: "New announcement", body: "" },
  payment_failed: {
    title: "Payment failed",
    body: "We couldn't take your last payment. Update your payment method to keep your plan.",
    to: "/profile/billing",
  },
  subscription_canceled: {
    title: "Subscription canceled",
    body: "Your plan will end at the close of the billing period.",
    to: "/profile/billing",
  },
  trial_ending: {
    title: "Your trial is ending soon",
    body: "Choose a plan to keep your paid features.",
    to: "/pricing",
  },
  parse_complete: {
    title: "Posting parsed",
    body: "Your job posting is ready to review.",
    to: "/applications/create",
  },
};

const text = (value: unknown) =>
  typeof value === "string" && value.trim() ? value : undefined;

// The payload shape isn't documented, so a title or message it carries wins
// over the default wording for its type.
export function describeNotification({ type, payload }: Notification): Wording {
  const base = DEFAULTS[type] ?? { title: "Notification", body: "" };
  return {
    title: text(payload.title) ?? base.title,
    body: text(payload.message) ?? text(payload.body) ?? base.body,
    to: base.to,
  };
}
