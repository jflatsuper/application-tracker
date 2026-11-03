import type {
  UserSettings,
  UserSettingsUpdate,
} from "@/features/profile/types";

// The digest seed changes real account settings, so the values it replaces
// are kept here and put back when the seeded data is removed.
const KEY = "seeded-settings-backup";

export function readSettingsBackup(): UserSettingsUpdate | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as UserSettingsUpdate) : null;
  } catch {
    return null;
  }
}

export function writeSettingsBackup(values: UserSettingsUpdate) {
  try {
    localStorage.setItem(KEY, JSON.stringify(values));
  } catch {
    // Without storage the original settings can't be restored later.
  }
}

export function clearSettingsBackup() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear if storage is blocked.
  }
}

export const hasSettingsBackup = () => readSettingsBackup() !== null;

// The current values of only those settings that `desired` would change.
export function pickChanged(
  previous: UserSettings,
  desired: UserSettingsUpdate,
): UserSettingsUpdate {
  const original: Record<string, unknown> = {};
  for (const key of Object.keys(desired) as (keyof UserSettings)[]) {
    if (desired[key] !== undefined && previous[key] !== desired[key]) {
      original[key] = previous[key];
    }
  }
  return original as UserSettingsUpdate;
}
