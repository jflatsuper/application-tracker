// AuthContext.ts
import type {
  AuthResponse,
  OAuthProvider,
  UserRead,
} from "@/features/auth/types";
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
  // Takes a session the server already issued (such as after a password reset).
  acceptSession: (response: AuthResponse) => void;
  logout: () => void;
  me: () => Promise<UserRead>;
  setUser: (user: UserRead) => void;
  loginWithProvider: (provider: OAuthProvider) => void;
  refresh: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
