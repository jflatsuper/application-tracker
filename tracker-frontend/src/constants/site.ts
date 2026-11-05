// Where people can reach a human. Set VITE_SUPPORT_EMAIL when building; with
// none set, the Contact page and its links are left out rather than shown empty.
export const SUPPORT_EMAIL: string | undefined =
  import.meta.env.VITE_SUPPORT_EMAIL?.trim() || undefined;
