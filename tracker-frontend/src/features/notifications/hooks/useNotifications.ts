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
// reconnect, which catches anything missed while the stream was down), and a
// push forwarded by the service worker.
export function useNotificationStream() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      void queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    };

    const controller = new AbortController();
    void listenForNudges(refresh, controller.signal);

    // The service worker forwards pushes that arrive while a tab is open.
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "nudge") refresh();
    };
    navigator.serviceWorker?.addEventListener("message", onMessage);

    return () => {
      controller.abort();
      navigator.serviceWorker?.removeEventListener("message", onMessage);
    };
  }, [queryClient]);
}
