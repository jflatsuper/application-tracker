import { apiClient } from "@/shared/libs/apiClient";
import type {
  Application,
  ApplicationCreate,
  ApplicationRead,
  ApplicationUpdate,
} from "./ApplicationSchema";

export const applicationsApi = {
  create: (data: ApplicationCreate) =>
    apiClient.post<Application>("/applications", data),
  update: (id: number, data: ApplicationUpdate) =>
    apiClient.patch<Application>(`/applications/${id}`, data),
  list: () => apiClient.get<ApplicationRead[]>("/applications"),
  remove: (id: number) => apiClient.delete(`/applications/${id}`),
};
