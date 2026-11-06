import { appLink } from "../shared/config";
import type { Entitlements } from "../shared/types";

type Props = { plan: Entitlements; onRecheck: () => void };

// Shown instead of the extension when the account isn't on Pro.
const UpgradeGate = ({ plan, onRecheck }: Props) => (
  <section className="stack" aria-labelledby="gate-title">
    <h1 id="gate-title">The extension is part of Pro</h1>
    <p className="muted">
      You're on the {plan.plan_name} plan. Upgrade to save job postings from any
      page and have applications added for you as you apply.
    </p>
    <a
      className="btn btn--primary btn--block"
      href={appLink("/pricing")}
      target="_blank"
      rel="noreferrer"
    >
      See Pro plans
    </a>
    <button className="btn btn--block" onClick={onRecheck}>
      I've upgraded, check again
    </button>
  </section>
);

export default UpgradeGate;
