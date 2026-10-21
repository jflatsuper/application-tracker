import { applicationsApi } from "@/features/applications/api/applicationApi";
import { atNoonUtc } from "@/features/applications/applicationFormValues";
import { ApiError } from "@/shared/libs/apiClient";
import { generateSeed } from "./seedData";
import {
  HISTORY_EVENTS,
  buildHistoryEvents,
  generateHistorySeed,
  type HistoryPlan,
} from "./seedHistoryData";

const STORAGE_KEY = "seeded-application-ids";
const BATCH_SIZE = 5;
const HISTORY_BATCH_SIZE = 2;

type Progress = (done: number, total: number) => void;

export function readSeededIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeSeededIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Without storage the seeded rows just can't be bulk-removed later.
  }
}

export async function seedApplications(onProgress: Progress) {
  const records = generateSeed();
  const ids = readSeededIds();
  let done = 0;
  let failed = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    await Promise.all(
      records.slice(i, i + BATCH_SIZE).map(async ({ data, followUpAt }) => {
        try {
          const created = await applicationsApi.create(data);
          ids.push(created.id);
          if (followUpAt) {
            await applicationsApi
              .update(created.id, { follow_up_at: followUpAt })
              .catch(() => {});
          }
        } catch {
          failed += 1;
        }
        done += 1;
        onProgress(done, records.length);
      }),
    );
    writeSeededIds(ids);
  }

  return { created: records.length - failed, failed };
}

// Creates the application, then replays its history in date order.
async function seedOneWithHistory(plan: HistoryPlan, ids: string[]) {
  const created = await applicationsApi.create(plan.data);
  ids.push(created.id);
  writeSeededIds(ids);

  // Creating may already record an event, so top up to the target.
  const count = Math.max(
    plan.journey.length - 1,
    HISTORY_EVENTS - created.events.length,
  );
  const events = buildHistoryEvents(plan, count);

  for (const event of events) {
    const common = {
      occurred_at: atNoonUtc(event.date),
      note: event.note,
      contact: event.contact ?? null,
    };
    if (event.kind === "status" && event.to) {
      await applicationsApi.changeStatus(created.id, {
        to_status: event.to,
        ...common,
      });
    } else {
      await applicationsApi.addFollowUp(created.id, common);
    }
  }

  await applicationsApi.update(created.id, {
    applied_at: atNoonUtc(events[0].date),
    ...(plan.followUpAt && { follow_up_at: plan.followUpAt }),
  });

  const detail = await applicationsApi.get(created.id);
  return detail.events.length;
}

export async function seedApplicationsWithHistory(onProgress: Progress) {
  const plans = generateHistorySeed();
  const ids = readSeededIds();
  let done = 0;
  let failed = 0;
  let events = 0;

  for (let i = 0; i < plans.length; i += HISTORY_BATCH_SIZE) {
    await Promise.all(
      plans.slice(i, i + HISTORY_BATCH_SIZE).map(async (plan) => {
        try {
          events += await seedOneWithHistory(plan, ids);
        } catch {
          failed += 1;
        }
        done += 1;
        onProgress(done, plans.length);
      }),
    );
  }

  return { created: plans.length - failed, failed, events };
}

export async function removeSeeded(onProgress: Progress) {
  const ids = readSeededIds();
  const remaining: string[] = [];
  let done = 0;

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    await Promise.all(
      ids.slice(i, i + BATCH_SIZE).map(async (id) => {
        try {
          await applicationsApi.remove(id);
        } catch (error) {
          const alreadyGone = error instanceof ApiError && error.status === 404;
          if (!alreadyGone) remaining.push(id);
        }
        done += 1;
        onProgress(done, ids.length);
      }),
    );
  }

  writeSeededIds(remaining);
  return { removed: ids.length - remaining.length, failed: remaining.length };
}
