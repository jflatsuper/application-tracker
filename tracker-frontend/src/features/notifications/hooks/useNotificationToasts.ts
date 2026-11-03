import { useEffect, useRef } from "react";
import { showNotificationToast } from "../components/NotificationToast";
import type { Notification } from "../types";
import { findNew } from "../unseen";

// Toasts each notification that arrives while the app is open. Pass
// `announce: false` when the browser already shows its own notification, so
// the same thing isn't announced twice; new arrivals are still remembered, so
// switching it back on never replays old ones.
export function useNotificationToasts(
  items: Notification[] | undefined,
  onOpen: (notification: Notification) => void,
  announce: boolean,
) {
  const seen = useRef<Set<string> | null>(null);
  const open = useRef(onOpen);

  useEffect(() => {
    open.current = onOpen;
  });

  useEffect(() => {
    if (!items) return;
    const result = findNew(seen.current, items);
    seen.current = result.seen;
    if (!announce) return;
    result.fresh.forEach((item) =>
      showNotificationToast(item, (n) => open.current(n)),
    );
  }, [items, announce]);
}
