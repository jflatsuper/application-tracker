import Icon from "@/shared/components/icon";
import "../style.scss";

import Button from "@/shared/components/button";
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
        <Button to="/pricing" variant="primary">
          Back to plans
        </Button>
        <Button to="/profile/billing" variant="ghost">
          View billing
        </Button>
      </div>
    </section>
  </>
);

export default CheckoutCancelledPage;
