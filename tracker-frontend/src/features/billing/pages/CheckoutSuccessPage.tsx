import { Link } from "react-router";
import Icon from "@/shared/components/Icon";
import { periodText } from "../entitlements";
import { useAwaitSubscription } from "../hooks/useAwaitSubscription";
import "../style.scss";

const CheckoutSuccessPage = () => {
  const { data, live, timedOut, isError, refetch } = useAwaitSubscription();

  const status = live
    ? {
        icon: "check" as const,
        title: `You're on ${data?.plan_name}`,
        text: [periodText(data!), "Your new features are ready to use."]
          .filter(Boolean)
          .join(" "),
      }
    : timedOut || isError
      ? {
          icon: "info" as const,
          title: "We're still confirming your payment",
          text: "This can take a few minutes. Your plan will update on its own, and you'll see it under Billing.",
        }
      : {
          icon: "info" as const,
          title: "Confirming your payment…",
          text: "This usually takes a few seconds.",
        };

  return (
    <>
      <title>Checkout</title>
      <meta name="robots" content="noindex" />
      <section
        className="result-page"
        aria-labelledby="result-title"
        aria-live="polite"
      >
        <div className="result-page__icon" aria-hidden="true">
          <Icon name={status.icon} size={24} />
        </div>
        <h1 id="result-title">{status.title}</h1>
        <p className="result-page__text">{status.text}</p>
        <div className="result-page__actions">
          <Link to="/applications" className="btn btn--primary">
            Go to applications
          </Link>
          <Link to="/profile/billing" className="btn btn--ghost">
            View billing
          </Link>
          {isError && (
            <button type="button" className="btn" onClick={() => refetch()}>
              Check again
            </button>
          )}
        </div>
      </section>
    </>
  );
};

export default CheckoutSuccessPage;
