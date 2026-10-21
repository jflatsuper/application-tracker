import { Link } from "react-router";
import Alert from "@/shared/components/Alert";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatDate } from "@/shared/libs/format";
import StatusChip from "@/features/applications/components/StatusChip";
import {
  STATUS_LABELS,
  STATUS_ORDER,
} from "@/features/applications/applicationStatus";
import { useAllApplications } from "@/features/applications/hooks/useApplicationQueries";
import {
  ACTIVE_STATUSES,
  countByStatus,
  followUpLabel,
  greeting,
  upcomingFollowUps,
} from "../homeStats";
import "../style.scss";

const SHOWN = 5;

const Dashboard = () => {
  const { user } = useAuth();
  const { data, isPending, isError, refetch } = useAllApplications();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const counts = countByStatus(items);
  const active = ACTIVE_STATUSES.reduce((sum, s) => sum + counts[s], 0);
  const followUps = upcomingFollowUps(items);
  const recent = [...items]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, SHOWN);

  const firstName =
    user && !user.is_anonymous
      ? user.full_name?.trim().split(/\s+/)[0]
      : undefined;

  const stats = [
    { label: "Total", value: total, to: "/applications" },
    { label: "Active", value: active, to: "/applications" },
    {
      label: "Interviewing",
      value: counts.interviewing,
      to: "/applications?status=interviewing",
    },
    { label: "Offers", value: counts.offer, to: "/applications?status=offer" },
  ];

  const summary =
    total === 0
      ? "Add your first application to start tracking."
      : `${active} active ${active === 1 ? "application" : "applications"}` +
        (followUps.length > 0
          ? `, ${followUps.length} ${followUps.length === 1 ? "follow-up" : "follow-ups"} scheduled.`
          : ".");

  const renderBody = () => {
    if (isError) {
      return (
        <div className="home-stack">
          <Alert>
            Couldn't load your applications. Check your connection and try
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
        <p className="home-state" role="status">
          Loading your applications…
        </p>
      );
    }

    if (total === 0) {
      return (
        <div className="home-empty">
          <h2>Track your first application</h2>
          <p>
            Log a role when you save it or apply. You can move it through
            screening, interviews and offers, and set when to follow up.
          </p>
          <Link to="/applications/create" className="btn btn--primary">
            Add application
          </Link>
        </div>
      );
    }

    return (
      <>
        <ul className="home-stats">
          {stats.map(({ label, value, to }) => (
            <li key={label}>
              <Link to={to} className="home-stat">
                <span className="home-stat__value">{value}</span>
                <span className="home-stat__label">{label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <section className="panel" aria-labelledby="pipeline-title">
          <h2 id="pipeline-title" className="panel__title">
            Pipeline
          </h2>
          <div className="home-pipeline__bar" aria-hidden="true">
            {STATUS_ORDER.filter((s) => counts[s] > 0).map((s) => (
              <span
                key={s}
                className={`home-pipeline__segment home-pipeline__segment--${s}`}
                style={{ flexGrow: counts[s] }}
              />
            ))}
          </div>
          <ul className="home-pipeline__legend">
            {STATUS_ORDER.filter((s) => counts[s] > 0).map((s) => (
              <li key={s}>
                <Link
                  to={`/applications?status=${s}`}
                  className="home-pipeline__item"
                  aria-label={`${STATUS_LABELS[s]}: ${counts[s]}`}
                >
                  <StatusChip status={s} />
                  <span>{counts[s]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="home-columns">
          <section className="panel" aria-labelledby="followups-title">
            <h2 id="followups-title" className="panel__title">
              Follow-ups
            </h2>
            {followUps.length === 0 ? (
              <p className="panel__text">
                No follow-ups scheduled. Set one from an application's page.
              </p>
            ) : (
              <ul className="home-rows">
                {followUps.slice(0, SHOWN).map(({ application, days }) => (
                  <li key={application.id} className="home-row">
                    <div className="home-row__main">
                      <Link
                        to={`/applications/${application.id}`}
                        className="home-row__title"
                      >
                        {application.company_name}
                      </Link>
                      <span className="home-row__sub">{application.title}</span>
                    </div>
                    <div className="home-row__meta">
                      <span
                        className={
                          days < 0
                            ? "home-row__when home-row__when--overdue"
                            : days === 0
                              ? "home-row__when home-row__when--today"
                              : "home-row__when"
                        }
                      >
                        {followUpLabel(days)}
                      </span>
                      <span>
                        {formatDate(application.follow_up_at, { utc: true })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel" aria-labelledby="recent-title">
            <h2 id="recent-title" className="panel__title">
              Recently updated
            </h2>
            <ul className="home-rows">
              {recent.map((application) => (
                <li key={application.id} className="home-row">
                  <div className="home-row__main">
                    <Link
                      to={`/applications/${application.id}`}
                      className="home-row__title"
                    >
                      {application.company_name}
                    </Link>
                    <span className="home-row__sub">{application.title}</span>
                  </div>
                  <div className="home-row__meta">
                    <StatusChip status={application.status} />
                    <span>{formatDate(application.updated_at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </>
    );
  };

  return (
    <section className="home">
      <div className="home__head">
        <div>
          <h1>
            {greeting()}
            {firstName && `, ${firstName}`}
          </h1>
          {data && <p className="home__sub">{summary}</p>}
        </div>
        <div className="home__actions">
          <Link to="/applications/create" className="btn btn--primary">
            Add application
          </Link>
          {total > 0 && (
            <Link to="/applications" className="btn">
              View all
            </Link>
          )}
        </div>
      </div>
      {renderBody()}
    </section>
  );
};

export default Dashboard;
