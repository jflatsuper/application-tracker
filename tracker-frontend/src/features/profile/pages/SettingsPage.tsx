import Alert from "@/shared/components/Alert";
import ProfileSection from "../components/ProfileSection";
import SettingsForm from "../components/SettingsForm";
import { useSettings } from "../hooks/useSettings";

const SettingsPage = () => {
  const { data, isPending, isError, refetch } = useSettings();

  return (
    <ProfileSection
      title="Settings"
      description="Reminders, your email digest and your timezone."
    >
      {isPending && (
        <p className="panel__text" role="status">
          Loading your settings…
        </p>
      )}

      {isError && (
        <>
          <Alert>
            Couldn't load your settings. Check your connection and try again.
          </Alert>
          <button
            type="button"
            className="btn profile__cta"
            onClick={() => refetch()}
          >
            Try again
          </button>
        </>
      )}

      {data && <SettingsForm settings={data} />}
    </ProfileSection>
  );
};

export default SettingsPage;
