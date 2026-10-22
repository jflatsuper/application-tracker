import { z } from "zod";
import type { DigestFrequency, UserSettings, UserSettingsUpdate } from "./types";

export const DIGEST_OPTIONS: { value: DigestFrequency; label: string }[] = [
  { value: "off", label: "Off" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

// Assumes 0 is Monday, like Python's weekday(). Change this list if the
// API counts from Sunday instead.
export const DIGEST_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
].map((label, index) => ({ value: String(index), label }));

const wholeNumber = (value: string, min: number, max: number) =>
  /^\d+$/.test(value) && Number(value) >= min && Number(value) <= max;

export const settingsSchema = z.object({
  follow_up_interval_days: z
    .string()
    .refine(
      (value) => wholeNumber(value, 1, 365),
      "Enter a whole number from 1 to 365.",
    ),
  digest_frequency: z.enum(["off", "daily", "weekly"]),
  digest_day: z.string(),
  timezone: z
    .string()
    .min(1, "Choose a timezone.")
    .max(64, "Use 64 characters or fewer."),
});

export type SettingsValues = z.infer<typeof settingsSchema>;

export const toSettingsValues = (settings: UserSettings): SettingsValues => ({
  follow_up_interval_days: String(settings.follow_up_interval_days),
  digest_frequency: settings.digest_frequency,
  digest_day: String(settings.digest_day),
  timezone: settings.timezone,
});

// PATCH only what changed.
export const toSettingsUpdate = (
  values: SettingsValues,
  dirty: Partial<Record<keyof SettingsValues, boolean | undefined>>,
): UserSettingsUpdate => {
  const update: UserSettingsUpdate = {};
  if (dirty.follow_up_interval_days) {
    update.follow_up_interval_days = Number(values.follow_up_interval_days);
  }
  if (dirty.digest_frequency) update.digest_frequency = values.digest_frequency;
  if (dirty.digest_day) update.digest_day = Number(values.digest_day);
  if (dirty.timezone) update.timezone = values.timezone;
  return update;
};

export const deviceTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;

// Browsers list every IANA zone. Keep the saved and device zones in the
// list even if a browser omits them (some leave out "UTC").
export function timeZoneOptions(current: string) {
  const known =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : [];
  const zones = [...new Set([current, deviceTimeZone(), ...known])];
  return zones.map((zone) => ({ value: zone, label: zone.replace(/_/g, " ") }));
}
