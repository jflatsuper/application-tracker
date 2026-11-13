// Plain data (no imports) because vite.config.ts reads it to write robots.txt.

// Signed-in areas and single-use link pages, which have nothing to index.
export const PRIVATE_PATHS = [
  "/applications",
  "/profile",
  "/notifications",
  "/billing",
  "/reset-password",
  "/verify-email",
  "/auth/",
  "/extension/",
];
