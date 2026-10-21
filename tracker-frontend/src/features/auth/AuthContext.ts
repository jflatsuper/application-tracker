// AuthContext.ts
import type { OAuthProvider, UserRead } from "@/features/auth/types";
import { createContext } from "react";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  status: AuthStatus;
  user: UserRead | null;
  login: (c: { email: string; password: string }) => Promise<void>;
  register: (c: {
    email: string;
    password: string;
    full_name?: string;
  }) => Promise<void>;
  continueAsGuest: () => Promise<void>;
  logout: () => void;
  me: () => Promise<UserRead>;
  setUser: (user: UserRead) => void;
  loginWithProvider: (provider: OAuthProvider) => void;
  refresh: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
