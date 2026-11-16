import { useState } from "react";
import { authApi } from "@/features/auth/api/authApi";
import { useAuth } from "@/features/auth/hooks/useAuth";
import "@/features/billing/style.scss";
import Alert from "@/shared/components/alert";
import Button from "@/shared/components/button";
import Icon from "@/shared/components/icon";
import { ApiError } from "@/shared/libs/apiClient";
import { retryHint } from "@/shared/libs/retryAfter";
import {
  ConnectError,
  browserCanConnect,
  connectExtension,
  extensionAvailable,
} from "../connect";

type Phase =
  | { name: "idle" }
  | { name: "connecting" }
  | { name: "done" }
  | { name: "error"; message: string };

function failureMessage(error: unknown): string {
  if (error instanceof ConnectError) {
    if (error.reason === "unreachable") {
      return "Couldn't reach the extension. Make sure it's installed and enabled, then try again.";
    }
    if (error.reason === "guest") {
      return "Guest accounts can't use the extension. Create an account first.";
    }
    if (error.reason === "unsupported") {
      return "This browser can't connect to the extension. Use Chrome, or sign in from the extension itself.";
    }
    return "The extension didn't accept the sign-in. Try again.";
  }
  if (error instanceof ApiError) {
    if (error.status === 401)
      return "Your session ended. Sign in again, then retry.";
    if (error.status === 429) {
      return `Too many attempts. ${retryHint(error.retryAfter, "Wait a moment and try again.")}`;
    }
  }
  return "Couldn't connect the extension. Check your connection and try again.";
}

// Where someone signed in on the website (with Google, LinkedIn or a password)
// can pass that sign-in to the Refresha browser extension. It asks first, and
// the session only goes to an extension ID this site was built to trust.
const ExtensionConnectPage = () => {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>({ name: "idle" });

  const connect = async () => {
    setPhase({ name: "connecting" });
    try {
      const tokens = await authApi.extensionTokens();
      await connectExtension(tokens.refresh_token);
      setPhase({ name: "done" });
    } catch (error) {
      setPhase({ name: "error", message: failureMessage(error) });
    }
  };

  const unavailable = !extensionAvailable();
  const guest = user?.is_anonymous === true;

  return (
    <>
      <title>Connect the extension</title>
      <meta name="robots" content="noindex" />
      <section className="result-page" aria-labelledby="connect-title">
        <div className="result-page__icon" aria-hidden="true">
          <Icon name={phase.name === "done" ? "check" : "user"} size={24} />
        </div>

        {phase.name === "done" ? (
          <>
            <h1 id="connect-title">Extension connected</h1>
            <p className="result-page__text" role="status">
              You can close this tab and open the Refresha extension.
            </p>
          </>
        ) : (
          <>
            <h1 id="connect-title">Connect the Refresha extension</h1>
            <p className="result-page__text">
              {unavailable
                ? "The browser extension isn't available on this site yet."
                : guest
                  ? "Guest accounts can't use the extension. Create an account to connect it."
                  : `This signs the extension in as ${user?.email ?? "you"}, so it can add jobs to your Refresha account. Only connect an extension you installed yourself.`}
            </p>
            {phase.name === "error" && <Alert>{phase.message}</Alert>}
            {!unavailable && !guest && !browserCanConnect() && (
              <Alert>
                This browser can't connect to the extension. Open this page in
                Chrome with the extension installed.
              </Alert>
            )}
            <div className="result-page__actions">
              {guest ? (
                <Button to="/register" variant="primary">
                  Create an account
                </Button>
              ) : (
                <Button
                  variant="primary"
                  disabled={unavailable || phase.name === "connecting"}
                  onClick={connect}
                >
                  {phase.name === "connecting"
                    ? "Connecting…"
                    : "Connect extension"}
                </Button>
              )}
              <Button to="/applications" variant="ghost">
                Not now
              </Button>
            </div>
          </>
        )}
      </section>
    </>
  );
};

export default ExtensionConnectPage;
