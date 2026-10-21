// pages/applications/useApplicationMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationKeys } from "./applicationKeys";
import { applicationsApi } from "./applicationApi";
import { toast } from "react-toastify";

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: applicationsApi.create,
    onSuccess: () => {
      toast.success("Application created successfully");
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}
