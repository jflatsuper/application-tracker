import Alert from "@/shared/components/alert";
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

import Button from "@/shared/components/button";
import Panel from "@/shared/components/panel";
import {
  PanelTitle,
  PanelText,
  PanelActions,
} from "@/shared/components/panel/Panel";
const BillingSection = () => {
  const { data, isPending, isError, refetch } = useEntitlements();
  const { data: plans } = usePlans();

  const upgrades = data && plans ? upgradeTargets(plans, data.plan_code) : [];

  return (
    <Panel id="billing" aria-labelledby="billing-title">
      <PanelTitle id="billing-title">Plan</PanelTitle>

      {isPending && <PanelText role="status">Loading your plan…</PanelText>}

      {isError && (
        <>
          <Alert>
            Couldn't load your plan. Check your connection and try again.
          </Alert>
          <Button
            type="button"
            style={{ alignSelf: "flex-start" }}
            onClick={() => refetch()}
          >
            Try again
          </Button>
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
          {periodText(data) && <PanelText>{periodText(data)}</PanelText>}

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

          <PanelText>
            Updating payment details isn't available online yet.
          </PanelText>
          <PanelActions>
            <Button to="/pricing">Compare plans</Button>
          </PanelActions>
        </>
      )}
    </Panel>
  );
};

export default BillingSection;
