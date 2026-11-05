import Icon from "@/shared/components/Icon";
import { timeAgo } from "@/shared/libs/format";
import { TONE_ICONS, describeNotification } from "../notificationText";
import type { Notification } from "../types";
import "./style.scss";

type Props = {
  item: Notification;
  onOpen: (item: Notification) => void;
  onDismiss: (item: Notification) => void;
};

// One row of the feed, shared by the bell's panel and the notifications page.
const NotificationItem = ({ item, onOpen, onDismiss }: Props) => {
  const { title, body, tone } = describeNotification(item);
  return (
    <li
      className="notification-item"
      data-unread={!item.read_at}
      data-tone={tone}
    >
      <button
        type="button"
        className="notification-item__main"
        onClick={() => onOpen(item)}
      >
        <span className="notification-item__icon">
          <Icon name={TONE_ICONS[tone]} size={16} />
        </span>
        <span className="notification-item__text">
          <span className="notification-item__title">{title}</span>
          {body && <span className="notification-item__body">{body}</span>}
          <time className="notification-item__time" dateTime={item.created_at}>
            {timeAgo(item.created_at)}
          </time>
        </span>
      </button>
      <button
        type="button"
        className="notification-item__dismiss"
        aria-label={`Dismiss ${title}`}
        onClick={() => onDismiss(item)}
      >
        <Icon name="x" size={16} />
      </button>
    </li>
  );
};

export default NotificationItem;
