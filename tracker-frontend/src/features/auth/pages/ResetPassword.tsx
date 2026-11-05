import { Link, useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@/shared/components/Alert";
import Input from "@/shared/components/form/Input";
import { authApi } from "../api/authApi";
import { authFlowErrorMessage } from "../errors";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "../authSchemas";
import "../style.scss";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const reset = useMutation({ mutationFn: authApi.resetPassword });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = ({ password }: ResetPasswordValues) => {
    if (!token || reset.isPending) return;
    reset.mutate({ token, password });
  };

  const body = () => {
    if (!token) {
      return (
        <>
          <div className="auth-card__head">
            <h1 id="auth-title">This link doesn't work</h1>
            <p>
              The reset link is missing or incomplete. Request a new one and
              use the link in the latest email.
            </p>
          </div>
          <div className="auth-card__actions">
            <Link to="/forgot-password" className="btn btn--primary">
              Request a new link
            </Link>
          </div>
        </>
      );
    }

    if (reset.isSuccess) {
      return (
        <>
          <div className="auth-card__head">
            <h1 id="auth-title">Password updated</h1>
            <p>You can now sign in with your new password.</p>
          </div>
          <div className="auth-card__actions">
            <Link to="/login" className="btn btn--primary">
              Sign in
            </Link>
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
          <button type="submit" className="btn btn--primary">
            {reset.isPending ? "Saving…" : "Save new password"}
          </button>
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
