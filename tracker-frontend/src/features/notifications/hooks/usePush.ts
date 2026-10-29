import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  disablePush,
  enablePush,
  readPushState,
  resyncPush,
} from "../push";

const pushKey = ["push", "state"] as const;

// Local browser state only, so it's cheap to re-read when the tab regains
// focus (the permission can be changed in the browser's own settings).
export const usePushState = () =>
  useQuery({ queryKey: pushKey, queryFn: readPushState });

export function useEnablePush() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: enablePush,
    onSettled: () => queryClient.invalidateQueries({ queryKey: pushKey }),
  });
}

export function useDisablePush() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disablePush,
    onSettled: () => queryClient.invalidateQueries({ queryKey: pushKey }),
  });
}

// Keeps the server's record of this browser current for the signed-in user.
export function useResyncPush() {
  useEffect(() => {
    resyncPush().catch(() => {
      // Push is optional; a failed resync is retried on the next visit.
    });
  }, []);
}
