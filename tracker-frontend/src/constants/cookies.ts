import { GOOGLE_TAG_ID } from "./site";

export type CategoryId = "analytics";

export type CookieDetail = {
  name: string;
  purpose: string;
  lifetime: string;
};

export type CookieCategory = {
  id: CategoryId;
  label: string;
  description: string;
  cookies: CookieDetail[];
};

// Always on, and exempt from consent because the site can't work without it.
// Shown in the settings dialog as a locked row.
export const ESSENTIAL = {
  label: "Essential",
  description:
    "Keeps you signed in and remembers your own settings. The site doesn't work without these.",
  cookies: [
    {
      name: "Sign-in cookie",
      purpose: "Keeps you signed in. Set by our API.",
      lifetime: "Until you sign out or it expires",
    },
    {
      name: "has_session",
      purpose: "Remembers you have a session so we can restore it.",
      lifetime: "Until you sign out",
    },
    {
      name: "profile-nav-collapsed",
      purpose: "Remembers whether the account sidebar is collapsed.",
      lifetime: "Until you clear your browser data",
    },
    {
      name: "refresha.anthropic-key.*",
      purpose: "Your own AI key, only if you chose to save it.",
      lifetime: "This tab, or this device if you chose to remember it",
    },
    {
      name: "cookie_consent",
      purpose: "Remembers the choices you make here.",
      lifetime: "12 months",
    },
  ] satisfies CookieDetail[],
};

// Everything that needs a yes. A category only exists in builds that use it, so
// with no Google tag there is nothing to ask and no banner. To add one: add its
// id to CategoryId, add an entry here, and load it only once
// isAllowed("<id>") is true (see googleTag.ts for the pattern).
export const COOKIE_CATEGORIES: CookieCategory[] = [
  ...(GOOGLE_TAG_ID
    ? [
        {
          id: "analytics" as const,
          label: "Analytics",
          description:
            "Counts which pages are visited so we can improve Refresha. Provided by Google Analytics.",
          cookies: [
            {
              name: "_ga",
              purpose: "Tells one visitor from another.",
              lifetime: "2 years",
            },
            {
              name: "_ga_<container id>",
              purpose: "Keeps track of a visit.",
              lifetime: "2 years",
            },
          ],
        },
      ]
    : []),
];
