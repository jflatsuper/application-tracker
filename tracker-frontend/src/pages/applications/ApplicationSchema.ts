import { z } from "zod";
export const Track = {
  FRONTEND: "frontend",
  FULLSTACK: "fullstack",
  PYTHON: "python",
  AI_ML: "ai_ml",
} as const;

export const Status = {
  APPLIED: "applied",
  SCREEN: "screen",
  INTERVIEW: "interview",
  OFFER: "offer",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
} as const;

export const applicationSchema = z.object({
  company: z.string(),
  role: z.string(),
  track: z.enum(Track),
  tier: z.number(),
  source: z.string().optional(),
  contact: z.string().optional(),
  status: z.enum(Status),
  date_applied: z.coerce.date().optional(),
  follow_up_date: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const applicationCreateSchema = applicationSchema;
export const applicationUpdateSchema = applicationSchema.partial();

export type Application = z.infer<typeof applicationSchema>;
export type ApplicationCreateInput = z.input<typeof applicationCreateSchema>;
export type ApplicationCreate = z.infer<typeof applicationCreateSchema>;
export type ApplicationUpdate = z.infer<typeof applicationUpdateSchema>;
export const applicationReadSchema = applicationSchema.extend({
  id: z.number(),
  created_at: z.coerce.date(),
});

export type ApplicationRead = z.infer<typeof applicationReadSchema>;
