export type NotificationType =
  | "announcement"
  | "payment_failed"
  | "subscription_canceled"
  | "trial_ending"
  | "parse_complete";

// `payload` is structured data, not text: the client words it.
export interface Notification {
  id: string;
  type: NotificationType;
  payload: Record<string, unknown>;
  created_at: string;
  read_at: string | null;
}

export interface NotificationPage {
  items: Notification[];
  total: number;
  limit: number;
  offset: number;
}

export type AnnouncementLevel = "info" | "warning" | "critical";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  level: AnnouncementLevel;
  publish_at: string;
  expires_at: string | null;
}
