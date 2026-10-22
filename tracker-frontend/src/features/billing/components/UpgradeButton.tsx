import { Link, useLocation } from "react-router";
import Alert from "@/shared/components/Alert";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Plan } from "@/features/billing/types";
import { useCheckout } from "../hooks/useBilling";
import "../style.scss";

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
      <Link
        to="/register"
        state={{ from: location }}
        className="btn btn--primary"
      >
        {guestLabel}
      </Link>
    );
  }

  return (
    <div className="upgrade">
      {checkout.isError && (
        <Alert>Couldn't start checkout. Try again in a moment.</Alert>
      )}
      <button
        type="button"
        className="btn btn--primary"
        aria-busy={checkout.isPending}
        onClick={() => checkout.mutate(plan.code)}
      >
        {checkout.isPending ? "Opening checkout…" : `Upgrade to ${plan.name}`}
      </button>
    </div>
  );
};

export default UpgradeButton;
