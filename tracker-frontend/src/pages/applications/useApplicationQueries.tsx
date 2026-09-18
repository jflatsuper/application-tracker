// pages/applications/useApplicationQueries.ts
import { useQuery } from "@tanstack/react-query";
import { applicationKeys } from "./applicationKeys";
import { applicationsApi } from "./applicationApi";

export function useApplications(filters?: { status?: string }) {
  return useQuery({
    queryKey: applicationKeys.list(filters),
    queryFn: () => applicationsApi.list(),
  });
}

export function useApplication(id: number) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    // queryFn: () => applicationsApi.getById(id),
  });
}
