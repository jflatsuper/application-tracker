import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import Alert from "@/shared/components/alert";
import Input from "@/shared/components/form/input";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useResendVerification } from "@/features/auth/hooks/useResendVerification";
import { needsEmailVerification } from "@/features/auth/verification";
import { formatDate } from "@/shared/libs/format";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import ProfileSection from "../components/ProfileSection";
import YourData from "../components/YourData";

import Button from "@/shared/components/button";
import Panel from "@/shared/components/panel";
import {
  PanelTitle,
  PanelText,
  PanelActions,
} from "@/shared/components/panel/Panel";
const profileSchema = z.object({
  full_name: z.string().max(255, "Use 255 characters or fewer."),
});
type ProfileValues = z.infer<typeof profileSchema>;

const AccountPage = () => {
  const { user } = useAuth();
  const update = useUpdateProfile();
  const resend = useResendVerification();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: { full_name: user?.full_name ?? "" },
    resetOptions: { keepDirtyValues: true },
  });

  if (!user) return null;

  const onSubmit = ({ full_name }: ProfileValues) => {
    if (!isDirty) {
      toast.info("No changes to save.");
      return;
    }
    update.mutate({ full_name: full_name.trim() || null });
  };

  return (
    <ProfileSection
      title="Profile"
      description="Your name and account details."
    >
      {user.is_anonymous && (
        <Panel as="div">
          <PanelTitle>You're using a guest account</PanelTitle>
          <PanelText>
            Create an account to keep your applications if you clear your
            browser data or switch devices.
          </PanelText>
          <Button to="/register" variant="primary" className="profile__cta">
            Create account
          </Button>
        </Panel>
      )}

      <Panel as="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <PanelTitle>Name</PanelTitle>
        {update.isError && (
          <Alert>Couldn't save. Check your connection and try again.</Alert>
        )}
        <Input
          label="Full name"
          autoComplete="name"
          error={errors.full_name?.message}
          {...register("full_name")}
        />
        <PanelActions>
          <Button type="submit" variant="primary" aria-busy={update.isPending}>
            {update.isPending ? "Saving…" : "Save changes"}
          </Button>
        </PanelActions>
      </Panel>

      <Panel>
        <PanelTitle>Account</PanelTitle>
        <dl className="profile-details">
          <dt>Email</dt>
          <dd>{user.email ?? "None (guest account)"}</dd>
          {user.email && (
            <>
              <dt>Email status</dt>
              <dd>
                {needsEmailVerification(user) ? (
                  <span className="profile-details__verify">
                    Not verified
                    <Button
                      type="button"
                      disabled={resend.isPending}
                      onClick={() => resend.mutate()}
                    >
                      {resend.isPending
                        ? "Sending…"
                        : "Send verification email"}
                    </Button>
                  </span>
                ) : (
                  `Verified${user.email_verified_at ? ` on ${formatDate(user.email_verified_at)}` : ""}`
                )}
              </dd>
            </>
          )}
          <dt>Account type</dt>
          <dd>{user.is_anonymous ? "Guest" : "Registered"}</dd>
          <dt>Member since</dt>
          <dd>{formatDate(user.created_at)}</dd>
        </dl>
      </Panel>

      <YourData />
    </ProfileSection>
  );
};

export default AccountPage;
