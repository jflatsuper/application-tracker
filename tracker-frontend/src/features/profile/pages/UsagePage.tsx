import { Link } from "react-router";
import Alert from "@/shared/components/Alert";
import { useEntitlements } from "@/features/billing/hooks/useBilling";
import StatusChip from "@/features/applications/components/StatusChip";
import {
  STATUS_LABELS,
  STATUS_ORDER,
} from "@/features/applications/applicationStatus";
import { useAllApplications } from "@/features/applications/hooks/useApplicationQueries";
import { countByStatus } from "@/features/home/homeStats";
import ProfileSection from "../components/ProfileSection";

const UsagePage = () => {
  const entitlements = useEntitlements();
  const applications = useAllApplications();

  const isError = entitlements.isError || applications.isError;
  const isPending = entitlements.isPending || applications.isPending;

  const total = applications.data?.total;
  const limit = entitlements.data?.entitlements.max_applications;
  const counts = countByStatus(applications.data?.items ?? []);
  const used = STATUS_ORDER.filter((status) => counts[status] > 0);

  return (
    <ProfileSection
      title="Usage"
      description="How much of your plan you're using."
    >
      {isError && (
        <>
          <Alert>
            Couldn't load your usage. Check your connection and try again.
          </Alert>
          <button
            type="button"
            className="btn profile__cta"
            onClick={() => {
              entitlements.refetch();
              applications.refetch();
            }}
          >
            Try again
          </button>
        </>
      )}

      {isPending && !isError && (
        <p className="panel__text" role="status">
          Loading usage…
        </p>
      )}

      {total !== undefined && entitlements.data && (
        <>
          <section className="panel">
            <h2 className="panel__title">Applications</h2>
            <p className="usage-figure">
              <span className="usage-figure__value">{total}</span>
              <span className="usage-figure__of">
                {typeof limit === "number"
                  ? `of ${limit} on ${entitlements.data.plan_name}`
                  : `Unlimited on ${entitlements.data.plan_name}`}
              </span>
            </p>
            {typeof limit === "number" && limit > 0 && (
              <div
                className="usage-bar"
                role="progressbar"
                aria-label="Applications used"
                aria-valuemin={0}
                aria-valuemax={limit}
                aria-valuenow={Math.min(total, limit)}
              >
                <span style={{ width: `${Math.min(100, (total / limit) * 100)}%` }} />
              </div>
            )}
          </section>

          <section className="panel">
            <h2 className="panel__title">By status</h2>
            {used.length === 0 ? (
              <p className="panel__text">
                No applications yet. They'll be counted here once you add some.
              </p>
            ) : (
              <ul className="usage-statuses">
                {used.map((status) => (
                  <li key={status}>
                    <Link
                      to={`/applications?status=${status}`}
                      aria-label={`${STATUS_LABELS[status]}: ${counts[status]}`}
                    >
                      <StatusChip status={status} />
                    </Link>
                    <span className="usage-statuses__count">
                      {counts[status]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </ProfileSection>
  );
};

export default UsagePage;
