export const notificationKeys = {
  all: ["notifications"] as const,
  unread: () => [...notificationKeys.all, "unread"] as const,
  feed: (limit: number) => [...notificationKeys.all, "feed", limit] as const,
};

export const announcementKeys = {
  all: ["announcements"] as const,
  active: () => [...announcementKeys.all, "active"] as const,
};
