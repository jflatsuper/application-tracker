import type {
  ApplicationCreate,
  ApplicationStatus,
} from "@/features/applications/ApplicationSchema";
import {
  ACTIVE_STATUSES,
  COMPANIES,
  LOCATIONS,
  NOTES,
  ROLES,
  dateOffset,
  randomTools,
} from "./seedData";

export const HISTORY_APPS = 10;
export const HISTORY_EVENTS = 10;

// Each journey starts at "saved" and ends where the application stands now.
const JOURNEYS: ApplicationStatus[][] = [
  ["saved", "applied", "screening", "interviewing", "offer", "accepted"],
  ["saved", "applied", "screening", "interviewing", "offer"],
  ["saved", "applied", "screening", "interviewing", "rejected"],
  ["saved", "applied", "screening", "rejected"],
  ["saved", "applied", "ghosted"],
  ["saved", "applied", "screening", "interviewing", "withdrawn"],
  ["saved", "applied", "screening", "interviewing"],
  ["saved", "applied", "screening"],
  ["saved", "applied"],
  ["saved", "applied", "interviewing", "offer", "withdrawn"],
];

const TERMINAL: ApplicationStatus[] = [
  "accepted",
  "rejected",
  "withdrawn",
  "ghosted",
];

const STATUS_NOTES: Record<ApplicationStatus, string[]> = {
  saved: ["Saved to apply later."],
  applied: ["Applied through the careers page.", "Applied with a tailored CV."],
  screening: ["Recruiter screen booked.", "Intro call with the recruiter."],
  interviewing: [
    "Technical interview scheduled.",
    "Panel interview this week.",
    "Take-home task sent over.",
  ],
  offer: ["Offer received, reviewing the details."],
  accepted: ["Accepted the offer."],
  rejected: ["Rejected after the final round.", "Not progressing, no feedback."],
  withdrawn: ["Withdrew after accepting another offer."],
  ghosted: ["No reply after several follow-ups."],
};

const FOLLOW_UP_NOTES = [
  "Sent a short check-in email.",
  "Messaged the recruiter on LinkedIn.",
  "Asked about next steps.",
  "Chased for feedback.",
  "Followed up after the interview.",
];

const CONTACTS = ["Priya Shah", "Tom Becker", "Alicia Moreno", "Daniel Osei"];

export type HistoryPlan = {
  data: ApplicationCreate;
  journey: ApplicationStatus[];
  spanDays: number;
  seed: number;
  followUpAt?: string;
};

export type HistoryEvent = {
  kind: "status" | "follow_up";
  to?: ApplicationStatus;
  date: string;
  note: string;
  contact?: string;
};

export function generateHistorySeed(): HistoryPlan[] {
  const base = Date.now();
  const { random, int, pick, shuffle } = randomTools(base);
  const companies = shuffle(COMPANIES);

  return shuffle(JOURNEYS).map((journey, index) => {
    const final = journey[journey.length - 1];
    const isActive = ACTIVE_STATUSES.includes(final);

    const data: ApplicationCreate = {
      company_name: companies[index],
      title: pick(ROLES),
      location: pick(LOCATIONS),
      source_url: `https://careers.example.com/jobs/${2000 + index}`,
      status: journey[0],
      notes: random() < 0.6 ? pick(NOTES) : undefined,
      tier: int(0, 5),
      follow_up_interval_days: isActive ? pick([7, 14]) : undefined,
    };

    return {
      data,
      journey,
      spanDays: int(60, 100),
      seed: base + index + 1,
      followUpAt: isActive ? dateOffset(int(-2, 10)) : undefined,
    };
  });
}

// `count` is how many events to add after creation. Status changes come
// first (the first one is always "applied"), follow-ups fill the gaps, and
// a finished application's last event is its final status change.
export function buildHistoryEvents(
  plan: HistoryPlan,
  count: number,
): HistoryEvent[] {
  const { int, pick, random } = randomTools(plan.seed);
  const transitions = plan.journey.slice(1);
  const steps = transitions.length;
  const final = plan.journey[plan.journey.length - 1];
  const finished = TERMINAL.includes(final);

  const statusAt = new Map<number, ApplicationStatus>();
  transitions.forEach((status, k) => {
    const position =
      k === 0
        ? 0
        : finished
          ? Math.round(1 + (k * (count - 2)) / (steps - 1))
          : Math.floor((k * count) / steps);
    statusAt.set(position, status);
  });

  const endGap = int(1, 4);
  return Array.from({ length: count }, (_, i) => {
    const daysAgo = Math.round(
      plan.spanDays - (i * (plan.spanDays - endGap)) / Math.max(1, count - 1),
    );
    const date = dateOffset(-daysAgo);
    const contact = random() < 0.6 ? pick(CONTACTS) : undefined;
    const to = statusAt.get(i);

    return to
      ? { kind: "status", to, date, note: pick(STATUS_NOTES[to]), contact }
      : { kind: "follow_up", date, note: pick(FOLLOW_UP_NOTES), contact };
  });
}
