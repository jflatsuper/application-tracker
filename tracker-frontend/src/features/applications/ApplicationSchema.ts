import { z } from "zod";
export const Track = {
  FRONTEND: "frontend",
  FULLSTACK: "fullstack",
  PYTHON: "python",
  AI_ML: "ai_ml",
} as const;

export const Status = {
  APPLIED: "applied",
  SCREEN: "screening",
  INTERVIEW: "interviewing",
  OFFER: "offer",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
  ACCEPTED: "accepted",
  GHOSTED: "ghosted",
  SAVED: "saved",
} as const;

export type ApplicationStatus = (typeof Status)[keyof typeof Status];

export const applicationSchema = z.object({
  company_name: z.string().min(1, "Enter the company name."),
  title: z.string().min(1, "Enter the job title."),
  location: z.string(),
  // track: z.enum(Track),
  // tier: z.number(),
  source_url: z.string().optional(),
  status: z.enum(Status),
  applied_at: z.coerce.date().optional(),
  notes: z.string().optional(),
  tier: z
    .number("Enter a whole number from 0 to 5.")
    .int("Enter a whole number from 0 to 5.")
    .min(0, "Enter a whole number from 0 to 5.")
    .max(5, "Enter a whole number from 0 to 5."),
  follow_up_interval_days: z
    .number("Enter a whole number from 1 to 365.")
    .int("Enter a whole number from 1 to 365.")
    .min(1, "Enter a whole number from 1 to 365.")
    .max(365, "Enter a whole number from 1 to 365.")
    .optional(),
});

export const applicationCreateSchema = applicationSchema;

export type Application = z.infer<typeof applicationSchema>;
export type ApplicationCreateInput = z.input<typeof applicationCreateSchema>;
export type ApplicationCreate = z.infer<typeof applicationCreateSchema>;

export type EventKind = "status_change" | "follow_up" | "note";

export interface ApplicationEvent {
  id: string;
  kind: EventKind;
  from_status: ApplicationStatus | null;
  to_status: ApplicationStatus | null;
  occurred_at: string;
  note: string | null;
  contact: string | null;
}

export interface ApplicationRead {
  id: string;
  company_name: string;
  title: string;
  location: string | null;
  status: ApplicationStatus;
  applied_at: string | null;
  created_at: string;
  updated_at: string;
  tier: number;
  follow_up_at: string | null;
  source_url: string | null;
  notes: string | null;
  job_posting_id: string | null;
  extra: Record<string, unknown>;
  follow_up_interval_days: number | null;
  reminder_sent_at: string | null;
  events: ApplicationEvent[];
}

export interface ApplicationSummary {
  id: string;
  company_name: string;
  title: string;
  location: string | null;
  status: ApplicationStatus;
  applied_at: string | null;
  created_at: string;
  updated_at: string;
  tier: number;
  follow_up_at: string | null;
}

export interface ApplicationPatch {
  company_name?: string;
  title?: string;
  location?: string | null;
  source_url?: string | null;
  applied_at?: string | null;
  notes?: string | null;
  tier?: number | null;
  follow_up_interval_days?: number | null;
  follow_up_at?: string | null;
}

export interface StatusChangeInput {
  to_status: ApplicationStatus;
  occurred_at?: string | null;
  note?: string | null;
  contact?: string | null;
}

export interface FollowUpInput {
  occurred_at?: string | null;
  note?: string | null;
  contact?: string | null;
}
