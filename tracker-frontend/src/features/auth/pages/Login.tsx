import { useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { authErrorMessage } from "@/features/auth/errors";
import Input from "@/shared/components/form/Input";
import Alert from "@/shared/components/Alert";
import ProviderButtons from "../components/ProviderButtons";
import { loginSchema, type LoginValues } from "../authSchemas";
import "../style.scss";

const PROVIDER_ERROR =
  "We couldn't sign you in with that provider. Try again, or use your email.";

function Login() {
  const { status, user, login, continueAsGuest } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formError, setFormError] = useState<string | null>(
    searchParams.get("error") === "signin_failed" ? PROVIDER_ERROR : null,
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname ?? "/applications";

  if (status === "authenticated" && user && !user.is_anonymous) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (values: LoginValues) => {
    if (isSubmitting) return;
    setFormError(null);
    try {
      await login(values);
    } catch (error) {
      setFormError(authErrorMessage(error, "login"));
    }
  };

  const onGuest = async () => {
    setFormError(null);
    try {
      await continueAsGuest();
      navigate("/applications");
    } catch {
      setFormError(
        "Couldn't start a guest session. Check your connection and try again.",
      );
    }
  };

  return (
    <>
      <title>Sign in</title>
      <section className="auth-page" aria-labelledby="auth-title">
        <div className="auth-card">
          <div className="auth-card__head">
            <h1 id="auth-title">Sign in</h1>
            <p>Pick up where you left off.</p>
          </div>

          {formError && <Alert>{formError}</Alert>}

          <form
            className="auth-form"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
            />
            <button type="submit" className="btn btn--primary">
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="auth-divider">or</div>
          <ProviderButtons verb="Continue with" />

          <div className="auth-footer">
            <p>
              New to Refresha?{" "}
              <Link to="/register" state={location.state}>
                Create an account
              </Link>
            </p>
            {status === "unauthenticated" && (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={onGuest}
              >
                Continue as guest
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
export default Login;
