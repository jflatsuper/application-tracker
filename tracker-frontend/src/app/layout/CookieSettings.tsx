import { useState } from "react";
import { Link } from "react-router";
import {
  COOKIE_CATEGORIES,
  ESSENTIAL,
  type CategoryId,
  type CookieDetail,
} from "@/constants/cookies";
import Button from "@/shared/components/button";
import Dialog from "@/shared/components/dialog";
import Switch from "@/shared/components/form/switch";
import {
  closeCookieSettings,
  saveChoices,
  useConsentState,
} from "@/shared/libs/consent";
import "./cookieConsent.scss";

type Draft = Record<CategoryId, boolean>;

const everything = (allowed: boolean) =>
  Object.fromEntries(COOKIE_CATEGORIES.map(({ id }) => [id, allowed])) as Draft;

const CookieList = ({ cookies }: { cookies: CookieDetail[] }) => (
  <details className="cookie-row__details">
    <summary>Cookies and storage ({cookies.length})</summary>
    <ul>
      {cookies.map((cookie) => (
        <li key={cookie.name}>
          <strong>{cookie.name}</strong> {cookie.purpose}{" "}
          <span>{cookie.lifetime}.</span>
        </li>
      ))}
    </ul>
  </details>
);

// The toggles. Mounted only while the dialog is open, so each opening starts
// from what is saved (anything not answered yet starts off).
const Choices = () => {
  const { choices } = useConsentState();
  const [draft, setDraft] = useState<Draft>(() => ({
    ...everything(false),
    ...choices,
  }));

  return (
    <>
      <p className="cookie-settings__intro">
        Choose which cookies we may use. Nothing optional runs unless you switch
        it on, and you can change this at any time. See the{" "}
        <Link to="/privacy" onClick={closeCookieSettings}>
          privacy policy
        </Link>
        .
      </p>

      <div className="cookie-row">
        <div className="cookie-row__head">
          <h3>{ESSENTIAL.label}</h3>
          <Switch
            checked
            disabled
            label={`${ESSENTIAL.label} cookies, always on`}
          />
        </div>
        <p>{ESSENTIAL.description}</p>
        <CookieList cookies={ESSENTIAL.cookies} />
      </div>

      {COOKIE_CATEGORIES.map((category) => (
        <div className="cookie-row" key={category.id}>
          <div className="cookie-row__head">
            <h3>{category.label}</h3>
            <Switch
              checked={draft[category.id]}
              onChange={(next) =>
                setDraft((current) => ({ ...current, [category.id]: next }))
              }
              label={`${category.label} cookies`}
            />
          </div>
          <p>{category.description}</p>
          <CookieList cookies={category.cookies} />
        </div>
      ))}

      <div className="cookie-settings__actions">
        <Button onClick={() => saveChoices(everything(false))}>
          Essential only
        </Button>
        <Button onClick={() => saveChoices(everything(true))}>
          Accept all
        </Button>
        <Button variant="primary" onClick={() => saveChoices(draft)}>
          Save choices
        </Button>
      </div>
    </>
  );
};

const CookieSettings = () => {
  const { settingsOpen } = useConsentState();
  return (
    <Dialog
      open={settingsOpen}
      onClose={closeCookieSettings}
      title="Cookie settings"
    >
      <Choices />
    </Dialog>
  );
};

export default CookieSettings;
