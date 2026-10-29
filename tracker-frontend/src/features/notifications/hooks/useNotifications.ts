import { useEffect } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { announcementApi, notificationApi } from "../api/notificationApi";
import { announcementKeys, notificationKeys } from "../api/notificationKeys";
import { listenForNudges } from "../stream";

export const FEED_SIZE = 20;

export const useUnreadCount = () =>
  useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: notificationApi.unreadCount,
    select: (data) => data.unread,
    refetchOnWindowFocus: false,
  });

export const useNotificationFeed = (enabled: boolean) =>
  useQuery({
    queryKey: notificationKeys.feed(FEED_SIZE),
    queryFn: () => notificationApi.list(FEED_SIZE),
    enabled,
    refetchOnWindowFocus: false,
  });

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids?: string[]) => notificationApi.markRead(ids),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useDismissNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.dismiss,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export const useActiveAnnouncements = (enabled: boolean) =>
  useQuery({
    queryKey: announcementKeys.active(),
    queryFn: announcementApi.active,
    enabled,
    refetchOnWindowFocus: false,
  });

export function useDismissAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: announcementApi.dismiss,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: announcementKeys.all }),
  });
}

// Keeps the badge, feed and announcements fresh while signed in. Nothing is
// polled: the server's nudge is the only trigger (plus the one fired on every
// reconnect, which catches anything missed while the stream was down).
export function useNotificationStream() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const controller = new AbortController();
    void listenForNudges(() => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      void queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    }, controller.signal);
    return () => controller.abort();
  }, [queryClient]);
}
