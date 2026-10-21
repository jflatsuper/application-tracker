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

export const applicationSchema = z.object({
  company_name: z.string(),
  title: z.string(),
  location: z.string(),
  // track: z.enum(Track),
  // tier: z.number(),
  source_url: z.string().optional(),
  contact: z.string().optional(),
  status: z.enum(Status),
  applied_at: z.coerce.date().optional(),
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
