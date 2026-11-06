import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { applicationKeys } from "@/features/applications/api/applicationKeys";
import {
  hasSettingsBackup,
  readSeededIds,
  removeSeeded,
  seedApplications,
  seedApplicationsWithHistory,
  seedDigestDue,
} from "@/dev/seedRunner";
import { DIGEST_SEED_COUNT } from "@/dev/seedDigestData";
import { HISTORY_APPS, HISTORY_EVENTS } from "@/dev/seedHistoryData";
import { settingsKeys } from "../hooks/useSettings";

import Button from "@/shared/components/button";
import Panel from "@/shared/components/panel";
import {
  PanelTitle,
  PanelText,
  PanelActions,
} from "@/shared/components/panel/Panel";
const SeedPanel = () => {
  const queryClient = useQueryClient();
  const [seededCount, setSeededCount] = useState(() => readSeededIds().length);
  const [hasBackup, setHasBackup] = useState(hasSettingsBackup);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const run = async (
    action: (
      onProgress: (done: number, total: number) => void,
    ) => Promise<string>,
    label: string,
  ) => {
    if (busy) return;
    setBusy(true);
    setStatus(null);
    try {
      const message = await action((done, total) =>
        setStatus(`${label} ${done} of ${total}…`),
      );
      setStatus(message);
    } catch {
      setStatus("Something went wrong. Check the console and try again.");
    } finally {
      setSeededCount(readSeededIds().length);
      setHasBackup(hasSettingsBackup());
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      setBusy(false);
    }
  };

  const seed = () =>
    run(async (onProgress) => {
      const { created, failed } = await seedApplications(onProgress);
      return failed
        ? `Added ${created} applications. ${failed} failed.`
        : `Added ${created} applications.`;
    }, "Adding");

  const seedHistory = () =>
    run(async (onProgress) => {
      const { created, failed, events } =
        await seedApplicationsWithHistory(onProgress);
      const base = `Added ${created} applications with ${events} events.`;
      return failed ? `${base} ${failed} failed.` : base;
    }, "Adding application");

  const seedDigest = () =>
    run(async (onProgress) => {
      const { created, failed, settingsReady, timezone } =
        await seedDigestDue(onProgress);
      const apps = failed
        ? `Added ${created} applications, ${failed} failed.`
        : `Added ${created} applications with follow-ups due.`;
      return settingsReady
        ? `Digest set to daily in ${timezone.replace(/_/g, " ")}. ${apps}`
        : `${apps} Couldn't update your digest settings, so no digest is due yet.`;
    }, "Adding");

  const remove = () =>
    run(async (onProgress) => {
      const { removed, failed, settingsRestored } =
        await removeSeeded(onProgress);
      const base = failed
        ? `Removed ${removed} applications. ${failed} could not be removed.`
        : `Removed ${removed} applications.`;
      return settingsRestored ? `${base} Digest settings restored.` : base;
    }, "Removing");

  return (
    <Panel tone="dev">
      <PanelTitle>Sample data</PanelTitle>
      <PanelText>
        Only shown in development. Adds sample applications to this account. The
        history seed replays {HISTORY_EVENTS} dated events per application, so
        the edit page's timeline is full. It makes a lot of requests, so give it
        a moment.
      </PanelText>
      <PanelText>
        The digest seed switches your email digest to daily in this device's
        timezone and adds {DIGEST_SEED_COUNT} applications whose follow-ups are
        due today, overdue or coming up. Removing the seeded data puts your
        digest settings back.
      </PanelText>
      {status && <PanelText role="status">{status}</PanelText>}
      <PanelActions>
        <Button type="button" variant="primary" aria-busy={busy} onClick={seed}>
          Seed 60 applications
        </Button>
        <Button type="button" aria-busy={busy} onClick={seedHistory}>
          Seed {HISTORY_APPS} with {HISTORY_EVENTS} events each
        </Button>
        <Button type="button" aria-busy={busy} onClick={seedDigest}>
          Seed digests due today
        </Button>
        {(seededCount > 0 || hasBackup) && (
          <Button
            type="button"
            variant="danger"
            aria-busy={busy}
            onClick={remove}
          >
            {seededCount > 0
              ? `Remove ${seededCount} seeded`
              : "Restore digest settings"}
          </Button>
        )}
      </PanelActions>
    </Panel>
  );
};

export default SeedPanel;
