// Where people can reach a human. Set VITE_SUPPORT_EMAIL when building; with
// none set, the Contact page and its links are left out rather than shown empty.
export const SUPPORT_EMAIL: string | undefined =
  import.meta.env.VITE_SUPPORT_EMAIL?.trim() || undefined;

// The address the site is served from, with no trailing slash (for example
// https://refresha.app). Set VITE_SITE_URL when building. Canonical links, the
// sitemap and the social-preview image need an absolute address, so they're
// left out when it isn't set.
export const SITE_URL: string | undefined =
  import.meta.env.VITE_SITE_URL?.trim().replace(/\/+$/, "") || undefined;
