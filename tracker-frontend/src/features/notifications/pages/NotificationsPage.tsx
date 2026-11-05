import { Link, useNavigate, useSearchParams } from "react-router";
import Alert from "@/shared/components/Alert";
import Pagination from "@/shared/components/Pagination";
import NotificationItem from "../components/NotificationItem";
import {
  FEED_SIZE,
  useDismissNotification,
  useMarkNotificationsRead,
  useNotificationPage,
  useUnreadCount,
} from "../hooks/useNotifications";
import { describeNotification } from "../notificationText";
import type { Notification } from "../types";
import "../components/style.scss";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(
    1,
    Number.parseInt(searchParams.get("page") ?? "1", 10) || 1,
  );

  const { data, isPending, isError, isPlaceholderData, refetch } =
    useNotificationPage(page);
  const { data: unread = 0 } = useUnreadCount();
  const markRead = useMarkNotificationsRead();
  const dismiss = useDismissNotification();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const goToPage = (next: number) =>
    setSearchParams(next > 1 ? { page: String(next) } : {});

  const openItem = (item: Notification) => {
    if (!item.read_at) markRead.mutate([item.id]);
    const { to } = describeNotification(item);
    if (to) navigate(to);
  };

  const renderBody = () => {
    if (isError) {
      return (
        <div className="applications__stack">
          <Alert>
            Couldn't load your notifications. Check your connection and try
            again.
          </Alert>
          <button type="button" className="btn" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      );
    }

    if (isPending) {
      return (
        <p className="applications__state" role="status">
          Loading notifications…
        </p>
      );
    }

    if (total === 0) {
      return (
        <div className="applications__empty">
          <h2>You're all caught up</h2>
          <p>Reminders, digests and billing notices show up here.</p>
          <Link to="/applications" className="btn">
            Go to applications
          </Link>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="applications__empty">
          <h2>That page is empty</h2>
          <p>There are no more notifications after page {page - 1}.</p>
          <button type="button" className="btn" onClick={() => goToPage(1)}>
            Back to the first page
          </button>
        </div>
      );
    }

    return (
      <>
        <ul
          className={
            isPlaceholderData
              ? "notification-page__list is-stale"
              : "notification-page__list"
          }
          aria-busy={isPlaceholderData}
        >
          {items.map((item) => (
            <NotificationItem
              key={item.id}
              item={item}
              onOpen={openItem}
              onDismiss={(entry) => dismiss.mutate(entry.id)}
            />
          ))}
        </ul>
        <Pagination
          page={page}
          pageSize={FEED_SIZE}
          total={total}
          onPageChange={goToPage}
        />
      </>
    );
  };

  return (
    <>
      <title>Notifications</title>
      <section className="applications">
        <div className="applications__head">
          <div>
            <h1>Notifications</h1>
            {data && (
              <p className="applications__sub">
                {unread > 0 ? `${unread} unread` : "All read"} · {total} in total
              </p>
            )}
          </div>
          <button
            type="button"
            className="btn"
            disabled={unread === 0 || markRead.isPending}
            onClick={() => markRead.mutate(undefined)}
          >
            Mark all read
          </button>
        </div>

        {renderBody()}
      </section>
    </>
  );
};

export default NotificationsPage;
