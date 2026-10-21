import {
  apiClient,
  BASE_URL,
  logout,
  markSessionHint,
  refreshAccessToken,
} from "@/shared/libs/apiClient";
import type { AuthResponse, OAuthProvider, UserRead } from "@/types/auth";

export const authApi = {
  baseUrl: "/v1/auth",
  guest: () => apiClient.post<AuthResponse>(`${authApi.baseUrl}/guest`, {}),
  login: (c: { email: string; password: string }) =>
    apiClient.post<AuthResponse>(`${authApi.baseUrl}/login`, c),
  // auth/authApi.ts
  signInWithProvider: (provider: string) => {
    markSessionHint();
    window.location.href = `${BASE_URL}/v1/auth/${provider}/authorize`;
  },
  register: (c: { email: string; password: string; full_name?: string }) =>
    apiClient.post<AuthResponse>(`${authApi.baseUrl}/register`, c),
  me: () => apiClient.get<UserRead>(`/v1/users/me`),
  logout: logout,
  authorizeUrl: (provider: OAuthProvider) =>
    `${BASE_URL}/v1/auth/${provider}/authorize`,
  refresh: refreshAccessToken,
};
