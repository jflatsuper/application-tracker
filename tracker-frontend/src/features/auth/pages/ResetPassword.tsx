import { Link, Navigate, useLocation } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@/shared/components/alert";
import Input from "@/shared/components/form/input";
import { authApi } from "../api/authApi";
import { authFlowErrorMessage } from "../errors";
import { useAuth } from "../hooks/useAuth";
import { looksLikeToken, readLinkToken } from "../linkToken";
import { resetPasswordSchema, type ResetPasswordValues } from "../authSchemas";
import "../style.scss";

import Button from "@/shared/components/button";
const ResetPassword = () => {
  const token = readLinkToken(useLocation());
  const { acceptSession } = useAuth();
  // The server signs you in once the password is set.
  const reset = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: (session) => {
      acceptSession(session);
      toast.success("Password updated. You're signed in.");
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = ({ password }: ResetPasswordValues) => {
    if (!looksLikeToken(token) || reset.isPending) return;
    reset.mutate({ token, password });
  };

  if (reset.isSuccess) return <Navigate to="/applications" replace />;

  const body = () => {
    if (!looksLikeToken(token)) {
      return (
        <>
          <div className="auth-card__head">
            <h1 id="auth-title">This link doesn't work</h1>
            <p>
              The reset link is missing or incomplete. Request a new one and use
              the link in the latest email.
            </p>
          </div>
          <div className="auth-card__actions">
            <Button to="/forgot-password" variant="primary">
              Request a new link
            </Button>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="auth-card__head">
          <h1 id="auth-title">Choose a new password</h1>
          <p>Use at least 8 characters.</p>
        </div>

        {reset.isError && (
          <Alert>{authFlowErrorMessage(reset.error, "reset")}</Alert>
        )}

        <form
          className="auth-form"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Input
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            error={errors.confirm?.message}
            {...register("confirm")}
          />
          <Button type="submit" variant="primary">
            {reset.isPending ? "Saving…" : "Save new password"}
          </Button>
        </form>

        {reset.isError && (
          <div className="auth-footer">
            <p>
              <Link to="/forgot-password">Request a new link</Link>
            </p>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <title>Choose a new password</title>
      <meta name="robots" content="noindex" />
      <section className="auth-page" aria-labelledby="auth-title">
        <div className="auth-card">{body()}</div>
      </section>
    </>
  );
};

export default ResetPassword;
