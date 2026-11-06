import { toast } from "react-toastify";
import { useDisablePush, useEnablePush, usePushState } from "../hooks/usePush";

import Button from "@/shared/components/button";
import Panel from "@/shared/components/panel";
import {
  PanelTitle,
  PanelText,
  PanelActions,
} from "@/shared/components/panel/Panel";
const MESSAGES = {
  unsupported: "This browser can't receive push notifications.",
  blocked:
    "Notifications are blocked for this site. Allow them in your browser's site settings, then come back here.",
  off: "Get a notification on this device when something needs your attention, even with Refresha closed.",
  on: "This device will get a notification when something needs your attention.",
} as const;

const PushSettings = () => {
  const { data: state } = usePushState();
  const enable = useEnablePush();
  const disable = useDisablePush();
  const busy = enable.isPending || disable.isPending;

  if (!state) return null;

  return (
    <Panel>
      <PanelTitle>Browser notifications</PanelTitle>
      <PanelText>{MESSAGES[state]}</PanelText>
      {(state === "off" || state === "on") && (
        <PanelActions>
          {state === "off" ? (
            <Button
              type="button"
              variant="primary"
              aria-busy={busy}
              disabled={busy}
              onClick={() =>
                enable.mutate(undefined, {
                  onSuccess: () => toast.success("Notifications turned on."),
                  onError: (error) => toast.error(error.message),
                })
              }
            >
              Turn on notifications
            </Button>
          ) : (
            <Button
              type="button"
              aria-busy={busy}
              disabled={busy}
              onClick={() =>
                disable.mutate(undefined, {
                  onSuccess: () => toast.success("Notifications turned off."),
                })
              }
            >
              Turn off notifications
            </Button>
          )}
        </PanelActions>
      )}
    </Panel>
  );
};

export default PushSettings;
