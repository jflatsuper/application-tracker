// pages/applications/applicationKeys.ts
export const applicationKeys = {
  all: ["applications"] as const,
  lists: () => [...applicationKeys.all, "list"] as const,
  list: (filters?: { status?: string; track?: string }) =>
    [...applicationKeys.lists(), filters] as const,
  details: () => [...applicationKeys.all, "detail"] as const,
  detail: (id: number) => [...applicationKeys.details(), id] as const,
};
