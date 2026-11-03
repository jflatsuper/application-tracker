import { toast } from "react-toastify";
import {
  useDisablePush,
  useEnablePush,
  usePushState,
} from "../hooks/usePush";

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
    <section className="panel">
      <h2 className="panel__title">Browser notifications</h2>
      <p className="panel__text">{MESSAGES[state]}</p>
      {(state === "off" || state === "on") && (
        <div className="panel__actions">
          {state === "off" ? (
            <button
              type="button"
              className="btn btn--primary"
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
            </button>
          ) : (
            <button
                type="button"
                className="btn"
                aria-busy={busy}
                disabled={busy}
                onClick={() =>
                  disable.mutate(undefined, {
                    onSuccess: () => toast.success("Notifications turned off."),
                  })
                }
              >
                Turn off notifications
              </button>
          )}
        </div>
      )}

    </section>
  );
};

export default PushSettings;
