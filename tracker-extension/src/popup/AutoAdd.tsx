import { useEffect, useState } from "react";
import { SITE_GROUPS, SITE_PATTERNS } from "../shared/sites";
import { local } from "../shared/storage";

const KEY = "autoAdd";

// The switch for automatic adding. Turning it on is what asks Chrome for access
// to the job sites: the extension has none until you say yes here.
const AutoAdd = () => {
  const [on, setOn] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const wanted = (await local.get<boolean>(KEY)) === true;
      const granted = await chrome.permissions.contains({
        origins: SITE_PATTERNS,
      });
      setOn(wanted && granted);
    })();
  }, []);

  const sync = () =>
    chrome.runtime.sendMessage({ type: "sync-watcher" }).catch(() => {});

  const toggle = async (next: boolean) => {
    setNote(null);
    if (next) {
      // Must be the first thing awaited: Chrome only allows this straight
      // from the click.
      const granted = await chrome.permissions.request({
        origins: SITE_PATTERNS,
      });
      if (!granted) {
        setNote(
          "Without access to those sites, it can't see your applications.",
        );
        return;
      }
      await local.set(KEY, true);
    } else {
      await local.set(KEY, false);
      await chrome.permissions.remove({ origins: SITE_PATTERNS });
    }
    await sync();
    setOn(next);
  };

  return (
    <section className="auto">
      <label className="auto__row">
        <input
          type="checkbox"
          role="switch"
          checked={on}
          onChange={(event) => void toggle(event.target.checked)}
        />
        <span>Add jobs automatically when I apply</span>
      </label>
      <p className="muted small">
        Works on {SITE_GROUPS.map((group) => group.label).join(", ")}. When an
        application goes through, it's added to Refresha as Applied, and you can
        undo it. Nothing is read until then.
      </p>
      {note && (
        <p role="alert" className="error small">
          {note}
        </p>
      )}
    </section>
  );
};

export default AutoAdd;
