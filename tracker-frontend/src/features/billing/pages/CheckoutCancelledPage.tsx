import { Link } from "react-router";
import Icon from "@/shared/components/Icon";
import "../style.scss";

const CheckoutCancelledPage = () => (
  <>
    <title>Checkout cancelled</title>
    <meta name="robots" content="noindex" />
    <section className="result-page" aria-labelledby="result-title">
      <div className="result-page__icon" aria-hidden="true">
        <Icon name="x" size={24} />
      </div>
      <h1 id="result-title">Checkout cancelled</h1>
      <p className="result-page__text">
        No payment was made and your plan hasn't changed. You can pick a plan
        again whenever you're ready.
      </p>
      <div className="result-page__actions">
        <Link to="/pricing" className="btn btn--primary">
          Back to plans
        </Link>
        <Link to="/profile/billing" className="btn btn--ghost">
          View billing
        </Link>
      </div>
    </section>
  </>
);

export default CheckoutCancelledPage;
