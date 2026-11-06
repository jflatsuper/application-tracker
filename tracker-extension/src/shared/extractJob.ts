import { companyFromUrl } from "./sites";
import type { JobDraft } from "./types";

const MAX = 255;
const clip = (value: string) => value.replace(/\s+/g, " ").trim().slice(0, MAX);

type Json = Record<string, unknown>;
const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const text = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (isObject(value) && typeof value.name === "string") return value.name;
  return "";
};

// JSON-LD can be one object, a list, or a @graph holding either.
function* walk(value: unknown): Generator<Json> {
  if (Array.isArray(value)) {
    for (const item of value) yield* walk(item);
  } else if (isObject(value)) {
    yield value;
    if (value["@graph"]) yield* walk(value["@graph"]);
  }
}

const isJobPosting = (node: Json) => {
  const type = node["@type"];
  return Array.isArray(type)
    ? type.includes("JobPosting")
    : type === "JobPosting";
};

function placeOf(location: unknown): string {
  if (Array.isArray(location)) {
    return location.map(placeOf).filter(Boolean).join("; ");
  }
  if (!isObject(location)) return "";
  const address = location.address;
  if (isObject(address)) {
    return [
      address.addressLocality,
      address.addressRegion,
      isObject(address.addressCountry)
        ? address.addressCountry.name
        : address.addressCountry,
    ]
      .filter((part): part is string => typeof part === "string" && !!part)
      .join(", ");
  }
  return typeof address === "string" ? address : "";
}

function fromJsonLd(doc: Document): Partial<JobDraft> {
  for (const script of doc.querySelectorAll(
    'script[type="application/ld+json"]',
  )) {
    let data: unknown;
    try {
      data = JSON.parse(script.textContent ?? "");
    } catch {
      continue;
    }
    for (const node of walk(data)) {
      if (!isJobPosting(node)) continue;
      let location = placeOf(node.jobLocation);
      if (node.jobLocationType === "TELECOMMUTE") {
        location = location ? `${location} (Remote)` : "Remote";
      }
      return {
        title: text(node.title) || text(node.name),
        company: text(node.hiringOrganization),
        location,
      };
    }
  }
  return {};
}

const meta = (doc: Document, selector: string) =>
  doc.querySelector<HTMLMetaElement>(selector)?.content?.trim() ?? "";

// "Senior Engineer at Acme", "Senior Engineer - Acme", "Senior Engineer | Acme".
export function splitHeadline(headline: string): {
  title: string;
  company: string;
} {
  const at = headline.match(/^(.+?)\s+at\s+(.+)$/i);
  if (at) return { title: at[1], company: at[2] };
  const parts = headline.split(/\s+[-|–—·]\s+/);
  if (parts.length >= 2) return { title: parts[0], company: "" };
  return { title: headline, company: "" };
}

// Reads what it can from a job posting page. Structured data first (exact),
// then the page's headline and the job board's address. Anything it can't find
// comes back empty for the person to fill in.
export function extractJob(doc: Document, url: string): JobDraft {
  const structured = fromJsonLd(doc);
  const headline = splitHeadline(
    meta(doc, 'meta[property="og:title"]') || doc.title || "",
  );

  return {
    title: clip(structured.title || headline.title),
    company: clip(
      structured.company ||
        headline.company ||
        companyFromUrl(url) ||
        meta(doc, 'meta[property="og:site_name"]'),
    ),
    location: clip(structured.location ?? ""),
    url,
  };
}
