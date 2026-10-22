// pages/applications/applicationKeys.ts
export const applicationKeys = {
  all: ["applications"] as const,
  lists: () => [...applicationKeys.all, "list"] as const,
  list: (filters?: { status?: string; limit?: number; offset?: number }) =>
    [...applicationKeys.lists(), filters] as const,
  collection: (status?: string) =>
    [...applicationKeys.lists(), "all", status ?? "any"] as const,
  details: () => [...applicationKeys.all, "detail"] as const,
  detail: (id: string) => [...applicationKeys.details(), id] as const,
};
