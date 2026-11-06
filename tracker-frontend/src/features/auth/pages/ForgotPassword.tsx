import { Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@/shared/components/alert";
import PageMeta from "@/shared/components/page-meta";
import Input from "@/shared/components/form/input";
import { authApi } from "../api/authApi";
import { authFlowErrorMessage } from "../errors";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "../authSchemas";
import "../style.scss";

import Button from "@/shared/components/button";
const ForgotPassword = () => {
  const send = useMutation({ mutationFn: authApi.forgotPassword });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = ({ email }: ForgotPasswordValues) => {
    if (send.isPending) return;
    send.mutate(email);
  };

  return (
    <>
      <PageMeta path="/forgot-password" />
      <section className="auth-page" aria-labelledby="auth-title">
        <div className="auth-card">
          {send.isSuccess ? (
            <>
              <div className="auth-card__head">
                <h1 id="auth-title">Check your email</h1>
                <p>
                  If an account exists for <strong>{send.variables}</strong>,
                  we've sent a link to reset the password. It may take a few
                  minutes to arrive, so check your spam folder too.
                </p>
              </div>
              <div className="auth-card__actions">
                <Button to="/login" variant="primary">
                  Back to sign in
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => send.reset()}
                >
                  Use a different email
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="auth-card__head">
                <h1 id="auth-title">Reset your password</h1>
                <p>
                  Enter your email and we'll send you a link to choose a new
                  one.
                </p>
              </div>

              {send.isError && (
                <Alert>{authFlowErrorMessage(send.error, "forgot")}</Alert>
              )}

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
                <Button type="submit" variant="primary">
                  {send.isPending ? "Sending…" : "Send reset link"}
                </Button>
              </form>

              <div className="auth-footer">
                <p>
                  Remembered it? <Link to="/login">Sign in</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default ForgotPassword;
