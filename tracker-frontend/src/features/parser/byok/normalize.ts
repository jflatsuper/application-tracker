import type { ParsedPosting } from "../types";

const clip = (value: unknown, max: number) =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;

// Model output is untrusted: keep only the known fields, trimmed to the
// same lengths the API enforces.
export function normalizeParsed(
  raw: Record<string, unknown>,
  source: string,
): ParsedPosting {
  const confidence =
    typeof raw.confidence === "number" && Number.isFinite(raw.confidence)
      ? Math.min(1, Math.max(0, raw.confidence))
      : 0.5;

  return {
    company_name: clip(raw.company_name, 255),
    title: clip(raw.title, 255),
    location: clip(raw.location, 255),
    salary_text: clip(raw.salary_text, 255),
    source_url: clip(raw.source_url, 2048),
    confidence,
    source,
  };
}
