import {
  ApiError,
  apiClient,
  BASE_URL,
  logout,
  refreshAccessToken,
} from "@/shared/libs/apiClient";
import type {
  AuthResponse,
  OAuthProvider,
  TokenPair,
  UserRead,
} from "@/features/auth/types";
import { parseRetryAfter } from "@/shared/libs/retryAfter";

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
    apiClient.post<void>(`${authApi.baseUrl}/forgot-password`, { email }),
  // Signs the user in, like login does.
  resetPassword: (c: { token: string; password: string }) =>
    apiClient.post<AuthResponse>(`${authApi.baseUrl}/reset-password`, c),
  verifyEmail: (token: string) =>
    apiClient.post<void>(`${authApi.baseUrl}/email/verify`, { token }),
  resendVerification: () =>
    apiClient.post<void>(`${authApi.baseUrl}/email/resend`, {}),
  exportData: () => apiClient.get<unknown>(`/v1/users/me/export`),
  deleteAccount: () => apiClient.delete(`/v1/users/me`),
  // Trades the sign-in cookie for a token pair in the response body, to hand a
  // session to the browser extension (which can't read the cookie). The API
  // sends the body to any caller that asks, so this exposes nothing new.
  extensionTokens: async (): Promise<TokenPair> => {
    const res = await fetch(`${BASE_URL}/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      throw new ApiError(
        res.status,
        `Request failed: ${res.status}`,
        undefined,
        res.status === 429 ? parseRetryAfter(res.headers) : undefined,
      );
    }
    return res.json();
  },
  logout: logout,
  authorizeUrl: (provider: OAuthProvider) =>
    `${BASE_URL}/v1/auth/${provider}/authorize`,
  refresh: refreshAccessToken,
};
