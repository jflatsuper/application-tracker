import { apiClient } from "@/shared/libs/apiClient";
import type { PaginatedList } from "@/types/global";
import type {
  Application,
  ApplicationCreate,
  ApplicationRead,
  ApplicationUpdate,
} from "./ApplicationSchema";

export const applicationsApi = {
  applicationBaseUrl: "/v1/applications",
  create: (data: ApplicationCreate) =>
    apiClient.post<Application>(`${applicationsApi.applicationBaseUrl}`, data),
  update: (id: number, data: ApplicationUpdate) =>
    apiClient.patch<Application>(
      `${applicationsApi.applicationBaseUrl}/${id}`,
      data,
    ),
  list: () =>
    apiClient.get<PaginatedList<ApplicationRead>>(
      `${applicationsApi.applicationBaseUrl}`,
    ),
  remove: (id: number) =>
    apiClient.delete(`${applicationsApi.applicationBaseUrl}/${id}`),
};
