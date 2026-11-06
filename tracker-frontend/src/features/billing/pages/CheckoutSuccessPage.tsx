import Icon from "@/shared/components/icon";
import { periodText } from "../entitlements";
import { useAwaitSubscription } from "../hooks/useAwaitSubscription";
import "../style.scss";

import Button from "@/shared/components/button";
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
          <Button to="/applications" variant="primary">
            Go to applications
          </Button>
          <Button to="/profile/billing" variant="ghost">
            View billing
          </Button>
          {isError && (
            <Button type="button" onClick={() => refetch()}>
              Check again
            </Button>
          )}
        </div>
      </section>
    </>
  );
};

export default CheckoutSuccessPage;
