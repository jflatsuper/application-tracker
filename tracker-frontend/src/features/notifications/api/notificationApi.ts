import { apiClient } from "@/shared/libs/apiClient";
import type {
  Announcement,
  NotificationPage,
} from "@/features/notifications/types";

export const notificationApi = {
  base: "/v1/notifications",
  list: (limit: number, offset = 0) =>
    apiClient.get<NotificationPage>(
      `${notificationApi.base}?limit=${limit}&offset=${offset}`,
    ),
  unreadCount: () =>
    apiClient.get<{ unread: number }>(`${notificationApi.base}/unread-count`),
  // No ids marks everything read.
  markRead: (ids?: string[]) =>
    apiClient.post<{ updated: number }>(`${notificationApi.base}/read`, {
      ids: ids ?? null,
    }),
  dismiss: (id: string) => apiClient.delete(`${notificationApi.base}/${id}`),
};

export const announcementApi = {
  base: "/v1/announcements",
  active: () => apiClient.get<Announcement[]>(`${announcementApi.base}/active`),
  dismiss: (id: string) =>
    apiClient.post<void>(`${announcementApi.base}/${id}/dismiss`, {}),
};
