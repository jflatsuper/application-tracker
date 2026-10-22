import { apiClient } from "@/shared/libs/apiClient";
import type { CancelBody, EntitlementsRead, Plan } from "@/features/billing/types";

export const billingApi = {
  baseUrl: "/v1/billing",
  plans: () => apiClient.get<Plan[]>(`${billingApi.baseUrl}/plans`),
  entitlements: () =>
    apiClient.get<EntitlementsRead>(`${billingApi.baseUrl}/entitlements`),
  checkout: (planCode: string) =>
    apiClient.post<{ url: string }>(`${billingApi.baseUrl}/checkout`, {
      plan_code: planCode,
    }),
  cancel: (body: CancelBody) =>
    apiClient.post<unknown>(`${billingApi.baseUrl}/subscription/cancel`, body),
  resume: () =>
    apiClient.post<unknown>(`${billingApi.baseUrl}/subscription/resume`, {}),
};
