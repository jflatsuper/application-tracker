import { Link, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import Alert from "@/shared/components/Alert";
import { authApi } from "../api/authApi";
import { useResendVerification } from "../hooks/useResendVerification";
import { VERIFY_LINK_INVALID, authFlowErrorMessage } from "../errors";
import { looksLikeToken, readLinkToken } from "../linkToken";
import { useAuth } from "../hooks/useAuth";
import "../style.scss";

const VerifyEmail = () => {
  const linkToken = readLinkToken(useLocation());
  // A token of the wrong length can't be valid, so don't send it.
  const token = looksLikeToken(linkToken) ? linkToken : null;
  const malformed = !!linkToken && !token;
  const { status, user, me, setUser } = useAuth();
  const canResend = status === "authenticated" && !user?.is_anonymous;

  // A token works once, so it is never retried or refetched.
  const verify = useQuery({
    queryKey: ["verify-email", token],
    queryFn: async () => {
      await authApi.verifyEmail(token as string);
      // Pick up the new verified date so the banner goes away.
      if (status === "authenticated") {
        try {
          setUser(await me());
        } catch {
          // The address is verified either way; the next load shows it.
        }
      }
      return true;
    },
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const resend = useResendVerification();

  const resendButton = canResend && (
    <button
      type="button"
      className="btn"
      disabled={resend.isPending}
      onClick={() => resend.mutate()}
    >
      {resend.isPending ? "Sending…" : "Send a new link"}
    </button>
  );

  const body = () => {
    if (!token && !malformed) {
      return (
        <>
          <div className="auth-card__head">
            <h1 id="auth-title">Check your email</h1>
            <p>
              We sent you a link to confirm your address. Open it on this
              device to finish.
            </p>
          </div>
          <div className="auth-card__actions">
            {resendButton}
            {!canResend && (
              <Link to="/login" className="btn btn--primary">
                Sign in
              </Link>
            )}
          </div>
        </>
      );
    }

    if (!malformed && verify.isPending) {
      return (
        <div className="auth-card__head" role="status">
          <h1 id="auth-title">Verifying your email…</h1>
          <p>Just a moment.</p>
        </div>
      );
    }

    if (malformed || verify.isError) {
      return (
        <>
          <div className="auth-card__head">
            <h1 id="auth-title">Couldn't verify your email</h1>
          </div>
          <Alert>
            {malformed
              ? VERIFY_LINK_INVALID
              : authFlowErrorMessage(verify.error, "verify")}
          </Alert>
          <div className="auth-card__actions">
            {resendButton}
            {!canResend && (
              <Link to="/login" className="btn btn--primary">
                Sign in to request a new link
              </Link>
            )}
          </div>
        </>
      );
    }

    return (
      <>
        <div className="auth-card__head">
          <h1 id="auth-title">Email verified</h1>
          <p>Thanks, your email address is confirmed.</p>
        </div>
        <div className="auth-card__actions">
          <Link
            to={status === "authenticated" ? "/applications" : "/login"}
            className="btn btn--primary"
          >
            {status === "authenticated" ? "Go to applications" : "Sign in"}
          </Link>
        </div>
      </>
    );
  };

  return (
    <>
      <title>Verify your email</title>
      <meta name="robots" content="noindex" />
      <section className="auth-page" aria-labelledby="auth-title">
        <div className="auth-card">{body()}</div>
      </section>
    </>
  );
};

export default VerifyEmail;
