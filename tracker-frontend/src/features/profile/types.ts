export type DigestFrequency = "off" | "daily" | "weekly";

export interface UserSettings {
  follow_up_interval_days: number;
  digest_frequency: DigestFrequency;
  digest_day: number;
  timezone: string;
}

export type UserSettingsUpdate = Partial<UserSettings>;
