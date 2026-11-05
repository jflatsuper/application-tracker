import { Link, useSearchParams } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import Alert from "@/shared/components/Alert";
import { toast } from "react-toastify";
import { authApi } from "../api/authApi";
import { authFlowErrorMessage } from "../errors";
import { useAuth } from "../hooks/useAuth";
import "../style.scss";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { status, user } = useAuth();
  const canResend = status === "authenticated" && !user?.is_anonymous;

  // A token works once, so it is never retried or refetched.
  const verify = useQuery({
    queryKey: ["verify-email", token],
    queryFn: async () => {
      await authApi.verifyEmail(token as string);
      return true;
    },
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const resend = useMutation({
    mutationFn: authApi.resendVerification,
    onSuccess: () => toast.success("Verification email sent"),
  });

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
    if (!token) {
      return (
        <>
          <div className="auth-card__head">
            <h1 id="auth-title">Check your email</h1>
            <p>
              We sent you a link to confirm your address. Open it on this
              device to finish.
            </p>
          </div>
          {resend.isError && (
            <Alert>{authFlowErrorMessage(resend.error, "resend")}</Alert>
          )}
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

    if (verify.isPending) {
      return (
        <div className="auth-card__head" role="status">
          <h1 id="auth-title">Verifying your email…</h1>
          <p>Just a moment.</p>
        </div>
      );
    }

    if (verify.isError) {
      return (
        <>
          <div className="auth-card__head">
            <h1 id="auth-title">Couldn't verify your email</h1>
          </div>
          <Alert>{authFlowErrorMessage(verify.error, "verify")}</Alert>
          {resend.isError && (
            <Alert>{authFlowErrorMessage(resend.error, "resend")}</Alert>
          )}
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
