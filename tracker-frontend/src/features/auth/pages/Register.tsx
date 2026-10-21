import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { authErrorMessage } from "@/features/auth/errors";
import Input from "@/shared/components/form/Input";
import Alert from "@/shared/components/Alert";
import ProviderButtons from "../components/ProviderButtons";
import { registerSchema, type RegisterValues } from "../authSchemas";
import "../style.scss";

const Register = () => {
  const { status, user, register: signUp } = useAuth();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname ?? "/applications";
  const isGuest = status === "authenticated" && !!user?.is_anonymous;

  if (status === "authenticated" && user && !user.is_anonymous) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async ({ full_name, email, password }: RegisterValues) => {
    if (isSubmitting) return;
    setFormError(null);
    try {
      await signUp({ email, password, full_name: full_name?.trim() || undefined });
    } catch (error) {
      setFormError(authErrorMessage(error, "register"));
    }
  };

  return (
    <>
      <title>Create account</title>
      <section className="auth-page" aria-labelledby="auth-title">
        <div className="auth-card">
          <div className="auth-card__head">
            <h1 id="auth-title">Create account</h1>
            <p>
              {isGuest
                ? "Your applications come with you."
                : "Keep every application in one calm place."}
            </p>
          </div>

          {formError && <Alert>{formError}</Alert>}

          <form
            className="auth-form"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <Input
              label="Full name (optional)"
              autoComplete="name"
              error={errors.full_name?.message}
              {...register("full_name")}
            />
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
              autoComplete="new-password"
              help="At least 8 characters."
              error={errors.password?.message}
              {...register("password")}
            />
            <button type="submit" className="btn btn--primary">
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <div className="auth-divider">or</div>
          <ProviderButtons verb="Sign up with" />

          <div className="auth-footer">
            <p>
              Already have an account?{" "}
              <Link to="/login" state={location.state}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Register;
