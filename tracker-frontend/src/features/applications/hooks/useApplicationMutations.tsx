// pages/applications/useApplicationMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationKeys } from "../api/applicationKeys";
import { applicationsApi } from "../api/applicationApi";
import type {
  ApplicationPatch,
  FollowUpInput,
  StatusChangeInput,
} from "../ApplicationSchema";
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

export function useUpdateApplication(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: ApplicationPatch) => applicationsApi.update(id, patch),
    onSuccess: (updated) => {
      toast.success("Changes saved");
      queryClient.setQueryData(applicationKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

export function useChangeApplicationStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StatusChangeInput) =>
      applicationsApi.changeStatus(id, input),
    onSuccess: (updated) => {
      toast.success("Status updated");
      queryClient.setQueryData(applicationKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

export function useAddFollowUp(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: FollowUpInput) =>
      applicationsApi.addFollowUp(id, input),
    onSuccess: (updated) => {
      toast.success("Follow-up recorded");
      queryClient.setQueryData(applicationKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => applicationsApi.remove(id),
    onSuccess: () => {
      toast.success("Application deleted");
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}
