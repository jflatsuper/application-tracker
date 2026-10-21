// auth/session.ts
import { hasSessionHint, refreshAccessToken } from "@/shared/libs/apiClient";
import type { UserRead } from "@/features/auth/types";
import { authApi } from "./api/authApi";

let pending: Promise<UserRead | null> | null = null;

export function bootstrapSession(): Promise<UserRead | null> {
  pending ??= (async () => {
    if (!hasSessionHint()) {
      return null;
    }

    if (!(await refreshAccessToken())) return null;
    return authApi.me();
  })().finally(() => {
    pending = null;
  });

  return pending;
}
