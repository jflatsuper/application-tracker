import type {
  CancelReason,
  Entitlements,
  EntitlementsRead,
  Plan,
} from "@/features/billing/types";
import { formatDate } from "@/shared/libs/format";

const LABELS: Record<string, string> = {
  max_applications: "Applications",
  llm_parsing: "AI-assisted parsing",
  email_ingest: "Email import",
};

export type FeatureRow = {
  key: string;
  label: string;
  included: boolean;
  detail?: string;
};

const humanize = (key: string) => {
  const text = key.replace(/^max_/, "").replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// The API sends entitlements as a free-form object, so unknown keys
// still render instead of being dropped.
export function featureRows(entitlements: Entitlements): FeatureRow[] {
  return Object.entries(entitlements).map(([key, value]) => {
    const label = LABELS[key] ?? humanize(key);
    if (typeof value === "boolean") return { key, label, included: value };
    if (value === null) return { key, label, included: true, detail: "Unlimited" };
    if (typeof value === "number") {
      return {
        key,
        label,
        included: value > 0,
        detail: key.startsWith("max_") ? `Up to ${value}` : String(value),
      };
    }
    return { key, label, included: true, detail: value };
  });
}

// Plans ranked above the current one, lowest first. With no current plan
// (signed out), the lowest plan counts as the baseline.
export function upgradeTargets(
  plans: Plan[],
  currentCode: string | undefined,
): Plan[] {
  const sorted = [...plans].sort((a, b) => a.sort_order - b.sort_order);
  const current = sorted.find((p) => p.code === currentCode) ?? sorted[0];
  const floor = current?.sort_order ?? -1;
  return sorted.filter((p) => p.sort_order > floor);
}

// A live subscription can be canceled; one already set to end can be resumed.
export function subscriptionAction(
  billing: EntitlementsRead,
): "cancel" | "resume" | null {
  if (billing.status !== "active" && billing.status !== "trialing") return null;
  return billing.cancel_at_period_end ? "resume" : "cancel";
}

export const CANCEL_REASONS: { value: CancelReason; label: string }[] = [
  { value: "too_expensive", label: "Too expensive" },
  { value: "missing_features", label: "Missing features" },
  { value: "unused", label: "Not using it enough" },
  { value: "too_complex", label: "Too complex" },
  { value: "low_quality", label: "Quality wasn't good enough" },
  { value: "customer_service", label: "Customer service" },
  { value: "switched_service", label: "Switched to another service" },
  { value: "other", label: "Other" },
];

export const SUBSCRIPTION_LABELS: Record<
  NonNullable<EntitlementsRead["status"]>,
  string
> = {
  trialing: "Trial",
  active: "Active",
  past_due: "Past due",
  canceled: "Canceled",
  expired: "Expired",
};

export function periodText(billing: EntitlementsRead): string | null {
  const { status, current_period_end, cancel_at_period_end } = billing;
  if (!status) return null;
  const end = formatDate(current_period_end);

  if (status === "expired") return end ? `Expired on ${end}.` : "Expired.";
  if (status === "canceled") {
    return end ? `Canceled. Access ends on ${end}.` : "Canceled.";
  }
  if (status === "past_due") return "Your last payment is past due.";
  if (cancel_at_period_end) {
    return end ? `Ends on ${end}.` : "Ends at the end of this period.";
  }
  if (status === "trialing") {
    return end ? `Trial ends on ${end}.` : "You're on a trial.";
  }
  return end ? `Renews on ${end}.` : null;
}
