import { apiClient } from "@/shared/libs/apiClient";
import type { UserSettings, UserSettingsUpdate } from "../types";

export const settingsApi = {
  path: "/v1/users/me/settings",
  get: () => apiClient.get<UserSettings>(settingsApi.path),
  update: (data: UserSettingsUpdate) =>
    apiClient.patch<UserSettings>(settingsApi.path, data),
};
