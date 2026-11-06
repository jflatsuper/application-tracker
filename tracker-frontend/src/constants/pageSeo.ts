// Plain data (no imports) because the build reads it too: vite/siteSeo.ts
// writes each page's tags into its own HTML file, so link previews and
// crawlers that don't run JavaScript see the right ones.

export interface PageSeo {
  title: string;
  description?: string;
  // Keep out of search results.
  noindex?: boolean;
}

export const HOME_DESCRIPTION =
  "Track job applications from saved to offer. See where each role stands, record follow-ups, and never lose track of a conversation.";

export const PAGE_SEO = {
  "/": {
    title: "Refresha · Job application tracker",
    description: HOME_DESCRIPTION,
  },
  "/pricing": {
    title: "Plans and pricing · Refresha",
    description:
      "Compare Refresha's plans and see what each one includes, from free application tracking to paid features like AI job-posting parsing.",
  },
  "/privacy": {
    title: "Privacy policy · Refresha",
    description:
      "How Refresha handles your data: what we store, why we store it, and the choices you have.",
  },
  "/terms": {
    title: "Terms of service · Refresha",
    description:
      "The terms that apply when you use Refresha, including accounts, plans and payments.",
  },
  "/contact": {
    title: "Contact · Refresha",
    description:
      "Get in touch with Refresha, and find quick answers to common questions.",
  },
  "/login": { title: "Sign in · Refresha", noindex: true },
  "/register": { title: "Create account · Refresha", noindex: true },
  "/forgot-password": {
    title: "Reset your password · Refresha",
    noindex: true,
  },
} as const satisfies Record<string, PageSeo>;

export type SeoPath = keyof typeof PAGE_SEO;
