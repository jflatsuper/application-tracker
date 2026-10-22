import { formatDate } from "@/shared/libs/format";
import type { ApplicationEvent } from "../ApplicationSchema";
import StatusChip from "./StatusChip";

const describe = (event: ApplicationEvent) => {
  if (event.kind === "status_change" && event.to_status) {
    return event.from_status ? (
      <>
        Moved from <StatusChip status={event.from_status} /> to{" "}
        <StatusChip status={event.to_status} />
      </>
    ) : (
      <>
        Added as <StatusChip status={event.to_status} />
      </>
    );
  }
  if (event.kind === "follow_up") {
    return <>Followed up{event.contact ? ` with ${event.contact}` : ""}</>;
  }
  return <>Note added</>;
};

const ApplicationHistory = ({ events }: { events: ApplicationEvent[] }) => {
  const sorted = [...events].sort((a, b) =>
    b.occurred_at.localeCompare(a.occurred_at),
  );

  if (sorted.length === 0) {
    return <p className="timeline__empty">Nothing recorded yet.</p>;
  }

  return (
    <ol className="timeline">
      {sorted.map((event) => (
        <li key={event.id} className="timeline__item">
          <span className="timeline__what">{describe(event)}</span>
          <time className="timeline__when" dateTime={event.occurred_at}>
            {formatDate(event.occurred_at)}
          </time>
          {event.note && <p className="timeline__note">{event.note}</p>}
        </li>
      ))}
    </ol>
  );
};

export default ApplicationHistory;
