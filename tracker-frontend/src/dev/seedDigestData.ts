import type { ApplicationCreate, ApplicationStatus } from "@/features/applications/ApplicationSchema";
import { atNoonUtc } from "@/features/applications/applicationFormValues";
import {
  COMPANIES,
  LOCATIONS,
  NOTES,
  ROLES,
  dateOffset,
  randomTools,
  type SeedRecord,
} from "./seedData";

// The follow-ups a digest has something to say about: three due today,
// two overdue and one coming up. All are active applications.
const PLAN: { status: ApplicationStatus; followUpInDays: number }[] = [
  { status: "applied", followUpInDays: 0 },
  { status: "applied", followUpInDays: 0 },
  { status: "screening", followUpInDays: 0 },
  { status: "interviewing", followUpInDays: -1 },
  { status: "applied", followUpInDays: -3 },
  { status: "screening", followUpInDays: 2 },
];

export const DIGEST_SEED_COUNT = PLAN.length;

export function generateDigestSeed(): SeedRecord[] {
  const { int, pick, shuffle } = randomTools(Date.now());
  const companies = shuffle(COMPANIES);

  return PLAN.map(({ status, followUpInDays }, index) => {
    const data: ApplicationCreate = {
      company_name: companies[index],
      title: pick(ROLES),
      location: pick(LOCATIONS),
      status,
      applied_at: new Date(atNoonUtc(dateOffset(-int(5, 20)))),
      notes: pick(NOTES),
      tier: int(0, 5),
      follow_up_interval_days: 7,
    };
    return { data, followUpAt: dateOffset(followUpInDays) };
  });
}
