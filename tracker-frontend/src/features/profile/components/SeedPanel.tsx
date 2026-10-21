import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { applicationKeys } from "@/features/applications/api/applicationKeys";
import {
  readSeededIds,
  removeSeeded,
  seedApplications,
  seedApplicationsWithHistory,
} from "@/dev/seedRunner";
import { HISTORY_APPS, HISTORY_EVENTS } from "@/dev/seedHistoryData";

const SeedPanel = () => {
  const queryClient = useQueryClient();
  const [seededCount, setSeededCount] = useState(() => readSeededIds().length);
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
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
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

  const remove = () =>
    run(async (onProgress) => {
      const { removed, failed } = await removeSeeded(onProgress);
      return failed
        ? `Removed ${removed} applications. ${failed} could not be removed.`
        : `Removed ${removed} applications.`;
    }, "Removing");

  return (
    <section className="panel panel--dev">
      <h2 className="panel__title">Sample data</h2>
      <p className="panel__text">
        Only shown in development. Adds sample applications to this account.
        The history seed replays {HISTORY_EVENTS} dated events per application,
        so the edit page's timeline is full. It makes a lot of requests, so
        give it a moment.
      </p>
      {status && (
        <p className="panel__text" role="status">
          {status}
        </p>
      )}
      <div className="panel__actions">
        <button
          type="button"
          className="btn btn--primary"
          aria-busy={busy}
          onClick={seed}
        >
          Seed 60 applications
        </button>
        <button
          type="button"
          className="btn"
          aria-busy={busy}
          onClick={seedHistory}
        >
          Seed {HISTORY_APPS} with {HISTORY_EVENTS} events each
        </button>
        {seededCount > 0 && (
          <button
            type="button"
            className="btn btn--danger"
            aria-busy={busy}
            onClick={remove}
          >
            Remove {seededCount} seeded
          </button>
        )}
      </div>
    </section>
  );
};

export default SeedPanel;
