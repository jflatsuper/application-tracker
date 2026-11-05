import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { billingApi } from "../api/billingApi";
import type { EntitlementsRead } from "../types";
import { billingKeys } from "./useBilling";

const POLL_MS = 3000;
const GIVE_UP_MS = 30_000;

const isLive = (billing: EntitlementsRead | undefined) =>
  billing?.status === "active" || billing?.status === "trialing";

// After paying, the provider tells our server through a webhook, which can land
// a moment after the redirect back here. Check every few seconds until the plan
// shows as live, and stop after a short while rather than polling forever.
export function useAwaitSubscription() {
  const [givenUp, setGivenUp] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setGivenUp(true), GIVE_UP_MS);
    return () => clearTimeout(timer);
  }, []);

  const query = useQuery({
    queryKey: billingKeys.entitlements(),
    queryFn: billingApi.entitlements,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchInterval: (current) =>
      givenUp || isLive(current.state.data) ? false : POLL_MS,
  });

  const live = isLive(query.data);
  return { ...query, live, timedOut: givenUp && !live };
}
