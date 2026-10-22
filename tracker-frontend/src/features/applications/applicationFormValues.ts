import { z } from "zod";
import type { ApplicationPatch, ApplicationRead } from "./ApplicationSchema";

const isUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const isWholeNumber = (value: string, min: number, max: number) =>
  /^\d+$/.test(value) && Number(value) >= min && Number(value) <= max;

export const applicationEditSchema = z.object({
  company_name: z
    .string()
    .trim()
    .min(1, "Enter the company name.")
    .max(255, "Use 255 characters or fewer."),
  title: z
    .string()
    .trim()
    .min(1, "Enter the job title.")
    .max(255, "Use 255 characters or fewer."),
  location: z.string().max(255, "Use 255 characters or fewer."),
  source_url: z
    .string()
    .max(2048, "Use 2048 characters or fewer.")
    .refine(
      (value) => value.trim() === "" || isUrl(value.trim()),
      "Enter a full link, starting with https://",
    ),
  applied_at: z.string(),
  follow_up_at: z.string(),
  notes: z.string(),
  tier: z
    .string()
    .refine((value) => isWholeNumber(value, 0, 5), "Enter a whole number from 0 to 5."),
  follow_up_interval_days: z
    .string()
    .refine(
      (value) => value === "" || isWholeNumber(value, 1, 365),
      "Enter a whole number from 1 to 365.",
    ),
});

export type EditValues = z.infer<typeof applicationEditSchema>;

export const applicationEventSchema = z.object({
  to_status: z.string(),
  occurred_at: z.string(),
  contact: z.string().max(255, "Use 255 characters or fewer."),
  note: z.string(),
});

export type EventValues = z.infer<typeof applicationEventSchema>;

export const todayLocal = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

// Noon UTC keeps the calendar date the same in every timezone.
export const atNoonUtc = (date: string) => `${date}T12:00:00Z`;

// A blank date or today means "now", which the API fills in itself.
export const toOccurredAt = (date: string): string | null =>
  !date || date === todayLocal() ? null : atNoonUtc(date);

export const toEditValues = (application: ApplicationRead): EditValues => ({
  company_name: application.company_name,
  title: application.title,
  location: application.location ?? "",
  source_url: application.source_url ?? "",
  applied_at: application.applied_at?.slice(0, 10) ?? "",
  follow_up_at: application.follow_up_at ?? "",
  notes: application.notes ?? "",
  tier: String(application.tier),
  follow_up_interval_days: application.follow_up_interval_days?.toString() ?? "",
});

export const toPatch = (
  values: EditValues,
  dirty: Partial<Record<keyof EditValues, boolean | undefined>>,
): ApplicationPatch => {
  const patch: ApplicationPatch = {};
  if (dirty.company_name) patch.company_name = values.company_name.trim();
  if (dirty.title) patch.title = values.title.trim();
  if (dirty.location) patch.location = values.location.trim() || null;
  if (dirty.source_url) patch.source_url = values.source_url.trim() || null;
  if (dirty.notes) patch.notes = values.notes.trim() || null;
  if (dirty.applied_at) {
    patch.applied_at = values.applied_at ? atNoonUtc(values.applied_at) : null;
  }
  if (dirty.follow_up_at) patch.follow_up_at = values.follow_up_at || null;
  if (dirty.tier) patch.tier = Number(values.tier);
  if (dirty.follow_up_interval_days) {
    patch.follow_up_interval_days = values.follow_up_interval_days
      ? Number(values.follow_up_interval_days)
      : null;
  }
  return patch;
};

export const toEventFields = (values: EventValues) => ({
  occurred_at: toOccurredAt(values.occurred_at),
  note: values.note.trim() || null,
  contact: values.contact.trim() || null,
});
