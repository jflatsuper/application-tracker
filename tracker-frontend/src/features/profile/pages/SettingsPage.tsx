import Alert from "@/shared/components/alert";
import PushSettings from "@/features/notifications/components/PushSettings";
import ProfileSection from "../components/ProfileSection";
import SettingsForm from "../components/SettingsForm";
import { useSettings } from "../hooks/useSettings";

import Button from "@/shared/components/button";
import { PanelText } from "@/shared/components/panel/Panel";
const SettingsPage = () => {
  const { data, isPending, isError, refetch } = useSettings();

  return (
    <ProfileSection
      title="Settings"
      description="Reminders, your email digest and your timezone."
    >
      {isPending && <PanelText role="status">Loading your settings…</PanelText>}

      {isError && (
        <>
          <Alert>
            Couldn't load your settings. Check your connection and try again.
          </Alert>
          <Button
            type="button"
            className="profile__cta"
            onClick={() => refetch()}
          >
            Try again
          </Button>
        </>
      )}

      {data && <SettingsForm settings={data} />}

      <PushSettings />
    </ProfileSection>
  );
};

export default SettingsPage;
