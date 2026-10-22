export type Entitlements = Record<string, boolean | number | string | null>;

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired";

export interface Plan {
  id: string;
  code: string;
  name: string;
  entitlements: Entitlements;
  sort_order: number;
}

export type CancelReason =
  | "customer_service"
  | "low_quality"
  | "missing_features"
  | "switched_service"
  | "too_complex"
  | "too_expensive"
  | "unused"
  | "other";

export interface CancelBody {
  reason: CancelReason | null;
  comment: string | null;
}

export interface EntitlementsRead {
  plan_code: string;
  plan_name: string;
  entitlements: Entitlements;
  status: SubscriptionStatus | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}
