import { useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  markSessionHint,
  setAccessToken,
  setAuthFailureHandler,
} from "@/shared/libs/apiClient";
import { AuthContext, type AuthStatus } from "../AuthContext";
import { authApi } from "../api/authApi";
import { bootstrapSession } from "../session";
import type { AuthResponse, UserRead, OAuthProvider } from "@/features/auth/types";

interface AuthState {
  status: AuthStatus;
  user: UserRead | null;
}
const LOGGED_OUT: AuthState = { status: "unauthenticated", user: null };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    status: "loading",
    user: null,
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    setAuthFailureHandler(() => {
      queryClient.clear();
      setState(LOGGED_OUT);
    });

    bootstrapSession()
      .then((user) => {
        setState(user ? { status: "authenticated", user } : LOGGED_OUT);
      })
      .catch(() => setState(LOGGED_OUT));

    return () => setAuthFailureHandler(null);
  }, [queryClient]);

  const accept = ({ user, tokens }: AuthResponse) => {
    setAccessToken(tokens.access_token);
    setState({ status: "authenticated", user });
  };

  const value = {
    ...state,
    login: async (c: { email: string; password: string }) =>
      accept(await authApi.login(c)),
    register: async (c: {
      email: string;
      password: string;
      full_name?: string;
    }) => accept(await authApi.register(c)),
    loginWithProvider: (provider: OAuthProvider) => {
      markSessionHint();
      window.location.href = authApi.authorizeUrl(provider);
    },
    me: authApi.me,
    setUser: (user: UserRead) => setState({ status: "authenticated", user }),
    continueAsGuest: async () => accept(await authApi.guest()),
    refresh: authApi.refresh,
    logout: async () => {
      await authApi.logout().catch(() => {});
      setAccessToken(null);
      queryClient.clear();
      setState(LOGGED_OUT);
    },
  };

  if (state.status === "loading") return <p>Loading...</p>;
  return <AuthContext value={value}>{children}</AuthContext>;
}
