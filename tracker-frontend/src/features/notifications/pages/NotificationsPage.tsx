import { useNavigate, useSearchParams } from "react-router";
import Pagination from "@/shared/components/pagination";
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

import Button from "@/shared/components/button";
import EmptyState from "@/shared/components/states/empty-state";
import ErrorState from "@/shared/components/states/error-state";
import LoadingState from "@/shared/components/states/loading-state";
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
        <ErrorState onRetry={() => refetch()}>
          Couldn't load your notifications. Check your connection and try again.
        </ErrorState>
      );
    }

    if (isPending) {
      return <LoadingState>Loading notifications…</LoadingState>;
    }

    if (total === 0) {
      return (
        <EmptyState
          title="You're all caught up"
          text="Reminders, digests and billing notices show up here."
        >
          <Button to="/applications">Go to applications</Button>
        </EmptyState>
      );
    }

    if (items.length === 0) {
      return (
        <EmptyState
          title="That page is empty"
          text={`There are no more notifications after page ${page - 1}.`}
        >
          <Button type="button" onClick={() => goToPage(1)}>
            Back to the first page
          </Button>
        </EmptyState>
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
                {unread > 0 ? `${unread} unread` : "All read"} · {total} in
                total
              </p>
            )}
          </div>
          <Button
            type="button"
            disabled={unread === 0 || markRead.isPending}
            onClick={() => markRead.mutate(undefined)}
          >
            Mark all read
          </Button>
        </div>

        {renderBody()}
      </section>
    </>
  );
};

export default NotificationsPage;
