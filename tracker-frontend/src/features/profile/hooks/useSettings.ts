import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { settingsApi } from "../api/settingsApi";

export const settingsKeys = {
  all: ["settings"] as const,
};

export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: settingsApi.get,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.update,
    onSuccess: (settings) => {
      toast.success("Settings saved");
      queryClient.setQueryData(settingsKeys.all, settings);
    },
  });
}
