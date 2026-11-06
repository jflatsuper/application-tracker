import PageMeta from "@/shared/components/page-meta";
import { useAuth } from "@/features/auth/hooks/useAuth";
import PlanFeatures from "@/features/billing/components/PlanFeatures";
import UpgradeButton from "@/features/billing/components/UpgradeButton";
import { upgradeTargets } from "@/features/billing/entitlements";
import { useEntitlements, usePlans } from "@/features/billing/hooks/useBilling";
import "@/features/billing/style.scss";

import Button from "@/shared/components/button";
import ErrorState from "@/shared/components/states/error-state";
import LoadingState from "@/shared/components/states/loading-state";
const PricingPage = () => {
  const { status } = useAuth();
  const signedIn = status === "authenticated";
  const { data: plans, isPending, isError, refetch } = usePlans();
  const { data: current } = useEntitlements(signedIn);

  const sorted = [...(plans ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const upgradeCodes = new Set(
    upgradeTargets(sorted, current?.plan_code).map((plan) => plan.code),
  );

  return (
    <>
      <PageMeta path="/pricing" />
      <section className="pricing">
        <header className="pricing__head">
          <h1>Plans</h1>
          <p>Compare what each plan includes.</p>
        </header>

        {isPending && <LoadingState>Loading plans…</LoadingState>}

        {isError && (
          <ErrorState onRetry={() => refetch()}>
            Couldn't load the plans. Check your connection and try again.
          </ErrorState>
        )}

        {plans && (
          <ul className="pricing__grid">
            {sorted.map((plan) => {
              const isCurrent = current?.plan_code === plan.code;
              return (
                <li
                  key={plan.id}
                  className={
                    isCurrent
                      ? "pricing-card pricing-card--current"
                      : "pricing-card"
                  }
                >
                  <div className="pricing-card__head">
                    <h2>{plan.name}</h2>
                    {isCurrent && (
                      <span className="billing-badge billing-badge--current">
                        Current plan
                      </span>
                    )}
                  </div>
                  <PlanFeatures entitlements={plan.entitlements} />
                  {upgradeCodes.has(plan.code) && (
                    <UpgradeButton
                      plan={plan}
                      guestLabel={`Create an account to get ${plan.name}`}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <div className="pricing__cta">
          {signedIn ? (
            <Button to="/profile">Your plan and billing</Button>
          ) : (
            <Button to="/login">Sign in</Button>
          )}
        </div>
        <p className="pricing__note">Pricing is shown at checkout.</p>
      </section>
    </>
  );
};

export default PricingPage;
