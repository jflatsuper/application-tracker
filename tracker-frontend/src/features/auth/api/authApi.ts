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
  forgotPassword: (email: string) =>
    apiClient.post<void>(`${authApi.baseUrl}/password/forgot`, { email }),
  resetPassword: (c: { token: string; password: string }) =>
    apiClient.post<void>(`${authApi.baseUrl}/password/reset`, c),
  verifyEmail: (token: string) =>
    apiClient.post<void>(`${authApi.baseUrl}/email/verify`, { token }),
  resendVerification: () =>
    apiClient.post<void>(`${authApi.baseUrl}/email/resend`, {}),
  exportData: () => apiClient.get<unknown>(`/v1/users/me/export`),
  deleteAccount: () => apiClient.delete(`/v1/users/me`),
  logout: logout,
  authorizeUrl: (provider: OAuthProvider) =>
    `${BASE_URL}/v1/auth/${provider}/authorize`,
  refresh: refreshAccessToken,
};
