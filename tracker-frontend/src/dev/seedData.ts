import type {
  ApplicationCreate,
  ApplicationStatus,
} from "@/features/applications/ApplicationSchema";
import { atNoonUtc } from "@/features/applications/applicationFormValues";

export type SeedRecord = { data: ApplicationCreate; followUpAt?: string };

// 60 records in total.
const STATUS_PLAN: [ApplicationStatus, number][] = [
  ["saved", 6],
  ["applied", 20],
  ["screening", 9],
  ["interviewing", 7],
  ["offer", 3],
  ["accepted", 1],
  ["rejected", 9],
  ["withdrawn", 2],
  ["ghosted", 3],
];

export const ACTIVE_STATUSES: ApplicationStatus[] = [
  "applied",
  "screening",
  "interviewing",
];

export const COMPANIES = [
  "Northwind Labs", "Brightpath", "Kestrel Health", "Lumen Analytics",
  "Tidewater", "Foxglove", "Orbit Works", "Harbor and Co", "Quillstone",
  "Marlow Systems", "Pinecrest Digital", "Ardent Cloud", "Saltmarsh Software",
  "Beacon Hill Tech", "Copperleaf", "Driftwood Data", "Elmstead",
  "Fernhill Games", "Granite Peak", "Halcyon AI", "Ironbridge", "Juniper Pay",
  "Kinetic Foods", "Larkspur", "Meridian Works", "Nightjar", "Oakham Labs",
  "Paperkite", "Quarry Bank Tech", "Redwater", "Silverline", "Thistle",
  "Umberfield", "Vantage Row", "Willowbrook", "Yarrow Digital", "Zephyr Cloud",
  "Alder and Finch", "Bramble Health", "Cinder Studio",
];

export const ROLES = [
  "Frontend Engineer", "Senior Frontend Engineer", "Full-stack Developer",
  "React Engineer", "Software Engineer", "Python Engineer", "Backend Engineer",
  "Platform Engineer", "Web Developer", "Machine Learning Engineer",
  "Staff Engineer", "TypeScript Developer",
];

export const LOCATIONS = [
  "Remote", "London", "Manchester", "Edinburgh", "Bristol", "Leeds",
  "Hybrid, London", "Hybrid, Manchester", "",
];

export const NOTES = [
  "Referred by a former colleague.",
  "Recruiter call booked.",
  "Take-home task due next week.",
  "Salary range looks good.",
  "Tech stack is React and Python.",
  "Applied through the careers page.",
  "Hiring manager replied quickly.",
  "Needs a portfolio link in the application.",
];

function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomTools(seed: number) {
  const random = mulberry32(seed);
  const int = (min: number, max: number) =>
    min + Math.floor(random() * (max - min + 1));
  const pick = <T,>(list: T[]) => list[int(0, list.length - 1)];
  const shuffle = <T,>(list: T[]) => {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = int(0, i);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  return { random, int, pick, shuffle };
}

const pad = (n: number) => String(n).padStart(2, "0");

export const dateOffset = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export function generateSeed(): SeedRecord[] {
  const { random, int, pick, shuffle } = randomTools(Date.now());

  const companies = shuffle(COMPANIES);
  const statuses = shuffle(
    STATUS_PLAN.flatMap(([status, count]) => Array(count).fill(status)),
  ) as ApplicationStatus[];

  return statuses.map((status, index) => {
    const isActive = ACTIVE_STATUSES.includes(status);
    const appliedDaysAgo =
      status === "applied" ? int(1, 30) : int(7, 75);

    const data: ApplicationCreate = {
      company_name: companies[index % companies.length],
      title: pick(ROLES),
      location: pick(LOCATIONS),
      source_url:
        random() < 0.7
          ? `https://careers.example.com/jobs/${1000 + index}`
          : undefined,
      status,
      applied_at:
        status === "saved"
          ? undefined
          : new Date(atNoonUtc(dateOffset(-appliedDaysAgo))),
      notes: random() < 0.6 ? pick(NOTES) : undefined,
      tier: int(0, 5),
      follow_up_interval_days:
        isActive && random() < 0.5 ? pick([7, 14]) : undefined,
    };

    return {
      data,
      followUpAt: isActive && random() < 0.6 ? dateOffset(int(-3, 12)) : undefined,
    };
  });
}
