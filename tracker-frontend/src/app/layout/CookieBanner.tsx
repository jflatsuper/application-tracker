import { Link } from "react-router";
import { COOKIE_CATEGORIES } from "@/constants/cookies";
import Button from "@/shared/components/button";
import {
  answerPending,
  openCookieSettings,
  pendingCategories,
  useConsentState,
} from "@/shared/libs/consent";
import "./cookieConsent.scss";

// Asks whether non-essential cookies may run. Saying no is as easy as saying
// yes, and nothing optional loads until the answer is yes. The page stays
// usable underneath.
const CookieBanner = () => {
  const { choices, settingsOpen } = useConsentState();
  const pending = pendingCategories(choices);
  if (pending.length === 0 || settingsOpen) return null;

  // First visit asks about everything. After a new category is added it asks
  // only about that one, and the earlier answers stand.
  const first = pending.length === COOKIE_CATEGORIES.length;
  const names = pending
    .map((category) => category.label.toLowerCase())
    .join(" and ");

  return (
    <section className="cookie-banner" aria-label="Cookie choices">
      <p>
        {first
          ? `We use essential cookies to keep you signed in. Can we also use ${names} cookies? `
          : `We've added a new kind of cookie: ${names}. `}
        Nothing optional loads unless you accept. See the{" "}
        <Link to="/privacy">privacy policy</Link>.
      </p>
      <div className="cookie-banner__actions">
        <Button variant="ghost" onClick={openCookieSettings}>
          Choose
        </Button>
        <Button onClick={() => answerPending(false)}>
          {first ? "Essential only" : "Decline"}
        </Button>
        <Button onClick={() => answerPending(true)}>
          {first ? "Accept all" : "Accept"}
        </Button>
      </div>
    </section>
  );
};

export default CookieBanner;
