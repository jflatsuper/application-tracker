import { useLocation } from "react-router";
import Alert from "@/shared/components/alert";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Plan } from "@/features/billing/types";
import { useCheckout } from "../hooks/useBilling";
import "../style.scss";

import Button from "@/shared/components/button";
type Props = {
  plan: Plan;
  guestLabel: string;
};

const UpgradeButton = ({ plan, guestLabel }: Props) => {
  const { status, user } = useAuth();
  const location = useLocation();
  const checkout = useCheckout();

  // Checkout needs a real account, so guests and visitors register first
  // and come straight back here.
  const registered = status === "authenticated" && !!user && !user.is_anonymous;
  if (!registered) {
    return (
      <Button to="/register" state={{ from: location }} variant="primary">
        {guestLabel}
      </Button>
    );
  }

  return (
    <div className="upgrade">
      {checkout.isError && (
        <Alert>Couldn't start checkout. Try again in a moment.</Alert>
      )}
      <Button
        type="button"
        variant="primary"
        aria-busy={checkout.isPending}
        onClick={() => checkout.mutate(plan.code)}
      >
        {checkout.isPending ? "Opening checkout…" : `Upgrade to ${plan.name}`}
      </Button>
    </div>
  );
};

export default UpgradeButton;
