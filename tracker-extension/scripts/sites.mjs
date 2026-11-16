// Job sites the automatic adding can watch. Kept as plain data so both the
// build (manifest permissions) and the code (src/shared/sites.ts) read one list.
export const SITE_GROUPS = [
  {
    id: "greenhouse",
    label: "Greenhouse",
    patterns: [
      "https://boards.greenhouse.io/*",
      "https://job-boards.greenhouse.io/*",
    ],
  },
  { id: "lever", label: "Lever", patterns: ["https://jobs.lever.co/*"] },
  { id: "ashby", label: "Ashby", patterns: ["https://jobs.ashbyhq.com/*"] },
  {
    id: "workable",
    label: "Workable",
    patterns: ["https://apply.workable.com/*"],
  },
];

export const SITE_PATTERNS = SITE_GROUPS.flatMap((group) => group.patterns);
