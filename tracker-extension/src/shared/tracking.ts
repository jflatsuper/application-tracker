import {
  createApplication,
  listApplications,
  markApplied,
  requirePro,
} from "./api";
import type { ApplicationSummary, JobDraft } from "./types";

const squash = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

// The list endpoint doesn't return links, so "the same job" means the same
// company and title.
export function findExisting(
  applications: ApplicationSummary[],
  job: Pick<JobDraft, "company" | "title">,
): ApplicationSummary | undefined {
  const company = squash(job.company);
  const title = squash(job.title);
  if (!company || !title) return undefined;
  return applications.find(
    (application) =>
      squash(application.company_name) === company &&
      squash(application.title) === title,
  );
}

export type TrackResult =
  | { kind: "created"; application: ApplicationSummary }
  | { kind: "updated"; application: ApplicationSummary }
  | { kind: "unchanged"; application: ApplicationSummary };

export const NEEDS_REVIEW_NOTE =
  "Added automatically from a job site. Check the details.";

// Adds a job, or moves a saved one to applied, never creating a twin.
// Refuses unless the account is on Pro, so nothing slips past the screens.
export async function trackJob(
  job: JobDraft,
  status: "saved" | "applied",
  options: { needsReview?: boolean } = {},
): Promise<TrackResult> {
  await requirePro();

  const existing = findExisting(await listApplications(), job);
  if (existing) {
    if (status === "applied" && existing.status === "saved") {
      return { kind: "updated", application: await markApplied(existing.id) };
    }
    return { kind: "unchanged", application: existing };
  }

  const application = await createApplication({
    company_name: job.company,
    title: job.title,
    location: job.location,
    source_url: job.url,
    status,
    ...(status === "applied" ? { applied_at: new Date().toISOString() } : {}),
    ...(options.needsReview ? { notes: NEEDS_REVIEW_NOTE } : {}),
    tier: 0,
  });
  return { kind: "created", application };
}
