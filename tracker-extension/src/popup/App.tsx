import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  SignedOutError,
  adoptBrowserSession,
  getEntitlements,
  hasSession,
  isPro,
  revalidateSession,
  signOut,
  storedUser,
  usesBrowserSession,
} from "../shared/api";
import type { Entitlements, StoredUser } from "../shared/types";
import AutoAdd from "./AutoAdd";
import Logo from "./Logo";
import { errorMessage } from "./errors";
import SavePage from "./SavePage";
import SignIn from "./SignIn";
import UpgradeGate from "./UpgradeGate";

type Gate =
  | { name: "loading" }
  | { name: "signedOut" }
  | { name: "free"; plan: Entitlements; shared: boolean }
  | { name: "pro"; user: StoredUser | undefined; shared: boolean }
  | { name: "error"; message: string };

// Everything in the extension sits behind two checks: you're signed in, and the
// account is on Pro. Nothing past this component renders until both pass.
const App = () => {
  const [gate, setGate] = useState<Gate>({ name: "loading" });

  const check = useCallback(async () => {
    setGate({ name: "loading" });
    try {
      // Signed in on the website? Then the extension is too: borrow that.
      if (!(await hasSession())) {
        if (!(await adoptBrowserSession())) {
          return setGate({ name: "signedOut" });
        }
      } else {
        // Still signed in on the website? If not, this signs the extension out.
        await revalidateSession();
      }
      const plan = await getEntitlements(true);
      const shared = await usesBrowserSession();
      setGate(
        isPro(plan)
          ? { name: "pro", user: await storedUser(), shared }
          : { name: "free", plan, shared },
      );
    } catch (error) {
      if (error instanceof SignedOutError) {
        // The session ended, so the page watcher shouldn't stay registered.
        await chrome.runtime
          .sendMessage({ type: "sync-watcher" })
          .catch(() => {});
        return setGate({ name: "signedOut" });
      }
      setGate({
        name: "error",
        message:
          error instanceof ApiError
            ? errorMessage(error)
            : "Something went wrong. Try again.",
      });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void check();
  }, [check]);

  // A session handed over from the website while this window is open.
  useEffect(() => {
    const onChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string,
    ) => {
      if (area === "local" && changes.refreshToken?.newValue) void check();
    };
    chrome.storage.onChanged.addListener(onChange);
    return () => chrome.storage.onChanged.removeListener(onChange);
  }, [check]);

  const leave = async () => {
    await signOut();
    // Tells the worker to take the watcher off the job sites.
    await chrome.runtime.sendMessage({ type: "sync-watcher" }).catch(() => {});
    setGate({ name: "signedOut" });
  };

  return (
    <main className="popup">
      <header className="popup__head">
        <span className="brand">
          <Logo />
          Refresha
        </span>
        {(gate.name === "pro" || gate.name === "free") && !gate.shared && (
          <button className="link" onClick={leave}>
            Sign out
          </button>
        )}
      </header>

      {gate.name === "loading" && <p className="muted">Loading…</p>}
      {gate.name === "signedOut" && <SignIn onSignedIn={check} />}
      {gate.name === "free" && (
        <UpgradeGate plan={gate.plan} onRecheck={check} />
      )}
      {gate.name === "pro" && (
        <>
          <SavePage />
          <AutoAdd />
          {gate.user?.email && (
            <p className="muted small">
              Signed in as {gate.user.email}
              {gate.shared
                ? " through the Refresha website. Sign out there to sign out here."
                : ". This extension has its own sign-in, so signing out of the website doesn't sign you out here. Use Sign out above."}
            </p>
          )}
        </>
      )}
      {gate.name === "error" && (
        <>
          <p role="alert" className="error">
            {gate.message}
          </p>
          <button className="btn" onClick={check}>
            Try again
          </button>
        </>
      )}
    </main>
  );
};

export default App;
