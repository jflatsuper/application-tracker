// pages/applications/useApplicationMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationKeys } from "./applicationKeys";
import { applicationsApi } from "./applicationApi";

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: applicationsApi.create,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() }),
  });
}
