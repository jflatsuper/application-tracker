import {
  apiClient,
  BASE_URL,
  logout,
  refreshAccessToken,
} from "@/shared/libs/apiClient";
import type { AuthResponse, OAuthProvider, UserRead } from "@/features/auth/types";

export const authApi = {
  baseUrl: "/v1/auth",
  guest: () => apiClient.post<AuthResponse>(`${authApi.baseUrl}/guest`, {}),
  login: (c: { email: string; password: string }) =>
    apiClient.post<AuthResponse>(`${authApi.baseUrl}/login`, c),
  register: (c: { email: string; password: string; full_name?: string }) =>
    apiClient.post<AuthResponse>(`${authApi.baseUrl}/register`, c),
  me: () => apiClient.get<UserRead>(`/v1/users/me`),
  updateMe: (data: { full_name: string | null }) =>
    apiClient.patch<UserRead>(`/v1/users/me`, data),
  logout: logout,
  authorizeUrl: (provider: OAuthProvider) =>
    `${BASE_URL}/v1/auth/${provider}/authorize`,
  refresh: refreshAccessToken,
};
