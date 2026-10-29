import { toast, type ToastOptions } from "react-toastify";
import { describeNotification } from "../notificationText";
import type { Notification } from "../types";
import "./style.scss";

const AUTO_CLOSE_MS = 8000;

// Tones map onto the toast kinds, which give each its own icon.
const KIND = {
  danger: "error",
  warning: "warning",
  info: "info",
  success: "success",
} as const;

// Shown in the app itself, so a new notification is seen even when the
// operating system doesn't draw a popup for it.
export function showNotificationToast(
  notification: Notification,
  onOpen: (notification: Notification) => void,
) {
  const { title, body, tone } = describeNotification(notification);

  const options: ToastOptions = {
    toastId: notification.id,
    // Away from the top-right, where the bell and account menu are.
    position: "bottom-right",
    autoClose: AUTO_CLOSE_MS,
    className: `notification-toast notification-toast--${tone}`,
    onClick: () => onOpen(notification),
  };

  toast[KIND[tone]](
    <div className="notification-toast__text">
      <strong>{title}</strong>
      {body && <span>{body}</span>}
    </div>,
    options,
  );
}
