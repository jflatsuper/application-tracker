import { useState, type FormEvent } from "react";
import { ApiError, login } from "../shared/api";
import { appLink } from "../shared/config";
import { errorMessage } from "./errors";

// Shown when there's no session to borrow. The easiest way in is the website:
// sign in there (Google, LinkedIn or email) and the extension picks it up.
// Email and password sit behind a disclosure so the screen has one clear action.
const SignIn = ({ onSignedIn }: { onSignedIn: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
      onSignedIn();
    } catch (caught) {
      setError(
        caught instanceof ApiError &&
          (caught.status === 400 ||
            caught.status === 401 ||
            caught.status === 422)
          ? "That email or password isn't right."
          : errorMessage(caught),
      );
      setBusy(false);
    }
  };

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="auth__intro">
        <h1>Sign in to Refresha</h1>
        <p className="muted">
          The extension is part of Pro. Use the same account as on the website.
        </p>
      </div>

      <div className="stack">
        <a
          className="btn btn--primary btn--block"
          href={appLink("/login")}
          target="_blank"
          rel="noreferrer"
        >
          Sign in on Refresha
        </a>
        <button
          type="button"
          className="link link--accent center"
          onClick={onSignedIn}
        >
          I've signed in, check again
        </button>
      </div>

      <p className="divider" role="separator">
        or
      </p>

      <details className="disclosure">
        <summary>Sign in with email</summary>
        <div className="disclosure__body">
          <form onSubmit={submit} className="stack">
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <button className="btn btn--primary btn--block" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
            <p className="small center">
              <a
                href={appLink("/forgot-password")}
                target="_blank"
                rel="noreferrer"
              >
                Forgot password?
              </a>
            </p>
          </form>
        </div>
      </details>

      <p className="muted small center">
        No account?{" "}
        <a href={appLink("/register")} target="_blank" rel="noreferrer">
          Create one
        </a>
        . Not picked up after signing in?{" "}
        <a
          href={appLink("/extension/connect")}
          target="_blank"
          rel="noreferrer"
        >
          Connect manually
        </a>
        .
      </p>
    </div>
  );
};

export default SignIn;
