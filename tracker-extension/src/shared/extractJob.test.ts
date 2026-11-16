import { describe, expect, it } from "vitest";
import { extractJob, splitHeadline } from "./extractJob";

const page = (head: string, title = "") => {
  const doc = document.implementation.createHTMLDocument();
  doc.head.innerHTML = head;
  if (title) doc.title = title;
  return doc;
};

const ld = (data: unknown) =>
  `<script type="application/ld+json">${JSON.stringify(data)}</script>`;

describe("extractJob", () => {
  it("reads a JobPosting from structured data", () => {
    const doc = page(
      ld({
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: "Senior Engineer",
        hiringOrganization: { "@type": "Organization", name: "Acme" },
        jobLocation: {
          address: {
            addressLocality: "Lagos",
            addressRegion: "LA",
            addressCountry: "NG",
          },
        },
      }),
    );
    expect(extractJob(doc, "https://example.com/job/1")).toEqual({
      title: "Senior Engineer",
      company: "Acme",
      location: "Lagos, LA, NG",
      url: "https://example.com/job/1",
    });
  });

  it("finds the posting inside a @graph and marks remote roles", () => {
    const doc = page(
      ld({
        "@graph": [
          { "@type": "WebSite", name: "Careers" },
          {
            "@type": ["JobPosting"],
            name: "Designer",
            hiringOrganization: "Globex",
            jobLocationType: "TELECOMMUTE",
          },
        ],
      }),
    );
    const job = extractJob(doc, "https://example.com/j");
    expect(job).toMatchObject({
      title: "Designer",
      company: "Globex",
      location: "Remote",
    });
  });

  it("ignores broken structured data and falls back to the headline", () => {
    const doc = page(
      `<script type="application/ld+json">{ nope</script>
       <meta property="og:title" content="Data Analyst at Initech" />`,
    );
    expect(extractJob(doc, "https://example.com/j")).toMatchObject({
      title: "Data Analyst",
      company: "Initech",
    });
  });

  it("takes the company from a job-board address when the page doesn't say", () => {
    const doc = page("", "Platform Engineer - Remote");
    expect(
      extractJob(doc, "https://jobs.lever.co/acme-corp/123/apply"),
    ).toMatchObject({ title: "Platform Engineer", company: "Acme Corp" });
  });

  it("returns empty fields instead of guessing", () => {
    expect(extractJob(page(""), "https://example.com/")).toEqual({
      title: "",
      company: "",
      location: "",
      url: "https://example.com/",
    });
  });
});

describe("splitHeadline", () => {
  it("handles the common separators", () => {
    expect(splitHeadline("QA Lead at Hooli")).toEqual({
      title: "QA Lead",
      company: "Hooli",
    });
    expect(splitHeadline("QA Lead | Hooli").title).toBe("QA Lead");
  });
});
