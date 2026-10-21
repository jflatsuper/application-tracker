// pages/applications/useApplicationQueries.ts
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { applicationKeys } from "../api/applicationKeys";
import { applicationsApi, type ListParams } from "../api/applicationApi";
import type { ApplicationStatus } from "../ApplicationSchema";

export function useApplications(params: ListParams = {}) {
  return useQuery({
    queryKey: applicationKeys.list(params),
    queryFn: () => applicationsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

// Every row, for the home screen's counts. The list page pages on the server.
export function useAllApplications(status?: ApplicationStatus) {
  return useQuery({
    queryKey: applicationKeys.collection(status),
    queryFn: () => applicationsApi.listAll(status),
    placeholderData: keepPreviousData,
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => applicationsApi.get(id),
    enabled: id !== "",
  });
}
