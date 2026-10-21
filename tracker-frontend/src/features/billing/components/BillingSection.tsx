import { Link } from "react-router";
import Alert from "@/shared/components/Alert";
import CancelSubscription from "@/features/billing/components/CancelSubscription";
import PlanFeatures from "@/features/billing/components/PlanFeatures";
import UpgradeButton from "@/features/billing/components/UpgradeButton";
import {
  SUBSCRIPTION_LABELS,
  periodText,
  upgradeTargets,
} from "@/features/billing/entitlements";
import { useEntitlements, usePlans } from "@/features/billing/hooks/useBilling";
import "@/features/billing/style.scss";

const BillingSection = () => {
  const { data, isPending, isError, refetch } = useEntitlements();
  const { data: plans } = usePlans();

  const upgrades = data && plans ? upgradeTargets(plans, data.plan_code) : [];

  return (
    <section className="panel" id="billing" aria-labelledby="billing-title">
      <h2 id="billing-title" className="panel__title">
        Plan
      </h2>

      {isPending && (
        <p className="panel__text" role="status">
          Loading your plan…
        </p>
      )}

      {isError && (
        <>
          <Alert>
            Couldn't load your plan. Check your connection and try again.
          </Alert>
          <button
            type="button"
            className="btn"
            style={{ alignSelf: "flex-start" }}
            onClick={() => refetch()}
          >
            Try again
          </button>
        </>
      )}

      {data && (
        <>
          <div className="billing-plan">
            <span className="billing-plan__name">{data.plan_name}</span>
            {data.status && (
              <span className={`billing-badge billing-badge--${data.status}`}>
                {SUBSCRIPTION_LABELS[data.status]}
              </span>
            )}
          </div>
          {periodText(data) && (
            <p className="panel__text">{periodText(data)}</p>
          )}

          <h3 className="billing__subtitle">What's included</h3>
          <PlanFeatures entitlements={data.entitlements} />

          {upgrades.length > 0 && (
            <div className="upgrade">
              {upgrades.map((plan) => (
                <UpgradeButton
                  key={plan.id}
                  plan={plan}
                  guestLabel="Create an account to upgrade"
                />
              ))}
            </div>
          )}

          <CancelSubscription billing={data} />

          <p className="panel__text">
            Updating payment details isn't available online yet.
          </p>
          <div className="panel__actions">
            <Link to="/pricing" className="btn">
              Compare plans
            </Link>
          </div>
        </>
      )}
    </section>
  );
};

export default BillingSection;
