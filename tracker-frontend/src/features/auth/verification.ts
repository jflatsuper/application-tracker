import type { UserRead } from "./types";

// Guests have no address to confirm; everyone else is asked to confirm theirs.
export const needsEmailVerification = (user: UserRead | null) =>
  !!user && !user.is_anonymous && !!user.email && !user.email_verified_at;
