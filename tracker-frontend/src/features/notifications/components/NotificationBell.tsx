import { useCallback, useId, useRef, useState } from "react";
import { useNavigate } from "react-router";
import Icon from "@/shared/components/Icon";
import { useDismissOnOutside } from "@/shared/hooks/useDismissOnOutside";
import { timeAgo } from "@/shared/libs/format";
import { useNotificationToasts } from "../hooks/useNotificationToasts";
import { usePushState, useResyncPush } from "../hooks/usePush";
import { TONE_ICONS, describeNotification } from "../notificationText";
import type { Notification } from "../types";
import {
  useDismissNotification,
  useMarkNotificationsRead,
  useNotificationFeed,
  useNotificationStream,
  useUnreadCount,
} from "../hooks/useNotifications";
import "./style.scss";

const MAX_BADGE = 9;

const NotificationBell = () => {
  useNotificationStream();
  useResyncPush();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);
  useDismissOnOutside(open, close, rootRef, triggerRef);

  const { data: unread = 0 } = useUnreadCount();
  // Always loaded, so new arrivals can be announced as toasts.
  const feed = useNotificationFeed(true);
  const markRead = useMarkNotificationsRead();
  const dismiss = useDismissNotification();

  const openItem = (item: Notification) => {
    if (!item.read_at) markRead.mutate([item.id]);
    const { to } = describeNotification(item);
    if (to) {
      close();
      navigate(to);
    }
  };

  const items = feed.data?.items ?? [];
  // With browser notifications on, the browser shows its own; the toast is for
  // everyone else, who would otherwise get no signal while the app is open.
  const { data: pushState } = usePushState();
  useNotificationToasts(feed.data?.items, openItem, pushState !== "on");

  return (
    <div className="notification-bell" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="notification-bell__trigger"
        aria-label={
          unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
        }
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="bell" size={20} />
        {unread > 0 && (
          <span className="notification-bell__badge" aria-hidden="true">
            {unread > MAX_BADGE ? `${MAX_BADGE}+` : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Notifications"
          className="notification-panel"
        >
          <div className="notification-panel__head">
            <h2>Notifications</h2>
            <button
              type="button"
              className="notification-panel__link"
              disabled={unread === 0 || markRead.isPending}
              onClick={() => markRead.mutate(undefined)}
            >
              Mark all read
            </button>
          </div>

          {feed.isPending ? (
            <p className="notification-panel__empty">Loading…</p>
          ) : feed.isError ? (
            <p className="notification-panel__empty" role="alert">
              Couldn't load notifications.{" "}
              <button
                type="button"
                className="notification-panel__link"
                onClick={() => feed.refetch()}
              >
                Try again
              </button>
            </p>
          ) : items.length === 0 ? (
            <p className="notification-panel__empty">You're all caught up.</p>
          ) : (
            <ul className="notification-panel__list">
              {items.map((item) => {
                const { title, body, tone } = describeNotification(item);
                return (
                  <li
                    key={item.id}
                    className="notification-item"
                    data-unread={!item.read_at}
                    data-tone={tone}
                  >
                    <button
                      type="button"
                      className="notification-item__main"
                      onClick={() => openItem(item)}
                    >
                      <span className="notification-item__icon">
                        <Icon name={TONE_ICONS[tone]} size={16} />
                      </span>
                      <span className="notification-item__text">
                        <span className="notification-item__title">
                          {title}
                        </span>
                        {body && (
                          <span className="notification-item__body">
                            {body}
                          </span>
                        )}
                        <time
                          className="notification-item__time"
                          dateTime={item.created_at}
                        >
                          {timeAgo(item.created_at)}
                        </time>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="notification-item__dismiss"
                      aria-label={`Dismiss ${title}`}
                      onClick={() => dismiss.mutate(item.id)}
                    >
                      <Icon name="x" size={16} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {feed.data && feed.data.total > items.length && (
            <p className="notification-panel__foot">
              Showing the latest {items.length} of {feed.data.total}.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
