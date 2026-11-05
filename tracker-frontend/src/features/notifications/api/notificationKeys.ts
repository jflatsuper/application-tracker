export const notificationKeys = {
  all: ["notifications"] as const,
  unread: () => [...notificationKeys.all, "unread"] as const,
  feed: (limit: number, offset = 0) =>
    [...notificationKeys.all, "feed", limit, offset] as const,
};

export const announcementKeys = {
  all: ["announcements"] as const,
  active: () => [...announcementKeys.all, "active"] as const,
};
