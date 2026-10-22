import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import Alert from "@/shared/components/Alert";
import Input from "@/shared/components/form/Input";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatDate } from "@/shared/libs/format";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import ProfileSection from "../components/ProfileSection";

const profileSchema = z.object({
  full_name: z.string().max(255, "Use 255 characters or fewer."),
});
type ProfileValues = z.infer<typeof profileSchema>;

const AccountPage = () => {
  const { user } = useAuth();
  const update = useUpdateProfile();

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
    <ProfileSection title="Profile" description="Your name and account details.">
      {user.is_anonymous && (
        <div className="panel">
          <h2 className="panel__title">You're using a guest account</h2>
          <p className="panel__text">
            Create an account to keep your applications if you clear your
            browser data or switch devices.
          </p>
          <Link to="/register" className="btn btn--primary profile__cta">
            Create account
          </Link>
        </div>
      )}

      <form className="panel" noValidate onSubmit={handleSubmit(onSubmit)}>
        <h2 className="panel__title">Name</h2>
        {update.isError && (
          <Alert>Couldn't save. Check your connection and try again.</Alert>
        )}
        <Input
          label="Full name"
          autoComplete="name"
          error={errors.full_name?.message}
          {...register("full_name")}
        />
        <div className="panel__actions">
          <button
            type="submit"
            className="btn btn--primary"
            aria-busy={update.isPending}
          >
            {update.isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      <section className="panel">
        <h2 className="panel__title">Account</h2>
        <dl className="profile-details">
          <dt>Email</dt>
          <dd>{user.email ?? "None (guest account)"}</dd>
          <dt>Account type</dt>
          <dd>{user.is_anonymous ? "Guest" : "Registered"}</dd>
          <dt>Member since</dt>
          <dd>{formatDate(user.created_at)}</dd>
        </dl>
      </section>
    </ProfileSection>
  );
};

export default AccountPage;
