import type {
  ApplicationStatus,
  ApplicationSummary,
} from "../applications/ApplicationSchema";
import { STATUS_ORDER } from "../applications/applicationStatus";

export const ACTIVE_STATUSES: ApplicationStatus[] = [
  "applied",
  "screening",
  "interviewing",
];

export function countByStatus(
  items: ApplicationSummary[],
): Record<ApplicationStatus, number> {
  const counts = Object.fromEntries(
    STATUS_ORDER.map((status) => [status, 0]),
  ) as Record<ApplicationStatus, number>;
  for (const item of items) counts[item.status] += 1;
  return counts;
}

const DAY_MS = 86_400_000;

// Follow-up dates are date-only ("2026-10-30"), so compare calendar days.
export function daysUntil(dateOnly: string, now: Date = new Date()): number {
  const [year, month, day] = dateOnly.slice(0, 10).split("-").map(Number);
  const target = Date.UTC(year, month - 1, day);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / DAY_MS);
}

export type FollowUp = { application: ApplicationSummary; days: number };

export function upcomingFollowUps(
  items: ApplicationSummary[],
  now: Date = new Date(),
): FollowUp[] {
  return items
    .filter(
      (item) =>
        item.follow_up_at !== null && ACTIVE_STATUSES.includes(item.status),
    )
    .map((application) => ({
      application,
      days: daysUntil(application.follow_up_at as string, now),
    }))
    .sort(
      (a, b) =>
        a.days - b.days ||
        a.application.company_name.localeCompare(b.application.company_name),
    );
}

export function followUpLabel(days: number): string {
  if (days < 0) return `Overdue by ${-days} ${-days === 1 ? "day" : "days"}`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export function greeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
