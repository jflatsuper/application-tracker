import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import type { CancelBody, EntitlementsRead } from "@/features/billing/types";
import { billingApi } from "../api/billingApi";

export const billingKeys = {
  all: ["billing"] as const,
  plans: () => [...billingKeys.all, "plans"] as const,
  entitlements: () => [...billingKeys.all, "entitlements"] as const,
};

const FIVE_MINUTES = 5 * 60 * 1000;

// Public, so it works before anyone signs in.
export function usePlans() {
  return useQuery({
    queryKey: billingKeys.plans(),
    queryFn: billingApi.plans,
    staleTime: FIVE_MINUTES,
  });
}

export function useEntitlements(enabled = true) {
  return useQuery({
    queryKey: billingKeys.entitlements(),
    queryFn: billingApi.entitlements,
    enabled,
  });
}

// Only follow https links to the payment provider (http for local dev).
function isSafeCheckoutUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" ||
      (import.meta.env.DEV && url.hostname === "localhost")
    );
  } catch {
    return false;
  }
}

export function useCheckout() {
  return useMutation({
    mutationFn: async (planCode: string) => {
      const { url } = await billingApi.checkout(planCode);
      if (!isSafeCheckoutUrl(url)) throw new Error("Unexpected checkout URL");
      return url;
    },
    onSuccess: (url) => {
      window.location.assign(url);
    },
  });
}

// Cancel and resume answer 202: the provider has accepted the change, but
// our own record only changes when its webhook arrives. Show the new state
// straight away, then poll until the server agrees (or give up and just
// show whatever the server says).
async function waitForCancelFlag(queryClient: QueryClient, expected: boolean) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    try {
      const fresh = await billingApi.entitlements();
      if (fresh.cancel_at_period_end === expected) {
        queryClient.setQueryData(billingKeys.entitlements(), fresh);
        return;
      }
    } catch {
      // Try again on the next round.
    }
  }
  queryClient.invalidateQueries({ queryKey: billingKeys.entitlements() });
}

function useCancelFlagChange<TVariables>(
  expected: boolean,
  request: (variables: TVariables) => Promise<unknown>,
  message: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onSuccess: () => {
      toast.success(message);
      queryClient.setQueryData<EntitlementsRead>(
        billingKeys.entitlements(),
        (old) => old && { ...old, cancel_at_period_end: expected },
      );
      void waitForCancelFlag(queryClient, expected);
    },
  });
}

export function useCancelSubscription() {
  return useCancelFlagChange<CancelBody>(
    true,
    billingApi.cancel,
    "Cancellation scheduled",
  );
}

export function useResumeSubscription() {
  return useCancelFlagChange<void>(
    false,
    () => billingApi.resume(),
    "Subscription resumed",
  );
}
