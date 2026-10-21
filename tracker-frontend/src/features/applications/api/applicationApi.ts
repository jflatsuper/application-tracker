import { apiClient } from "@/shared/libs/apiClient";
import type { PaginatedList } from "@/types/global";
import type {
  ApplicationCreate,
  ApplicationPatch,
  ApplicationRead,
  ApplicationStatus,
  ApplicationSummary,
  FollowUpInput,
  StatusChangeInput,
} from "../ApplicationSchema";

export interface ListParams {
  status?: ApplicationStatus;
  limit?: number;
  offset?: number;
}

const FETCH_PAGE_SIZE = 100;
const MAX_ROWS = 1000;

export const applicationsApi = {
  applicationBaseUrl: "/v1/applications",
  create: (data: ApplicationCreate) =>
    apiClient.post<ApplicationRead>(
      `${applicationsApi.applicationBaseUrl}`,
      data,
    ),
  get: (id: string) =>
    apiClient.get<ApplicationRead>(
      `${applicationsApi.applicationBaseUrl}/${id}`,
    ),
  update: (id: string, data: ApplicationPatch) =>
    apiClient.patch<ApplicationRead>(
      `${applicationsApi.applicationBaseUrl}/${id}`,
      data,
    ),
  changeStatus: (id: string, data: StatusChangeInput) =>
    apiClient.post<ApplicationRead>(
      `${applicationsApi.applicationBaseUrl}/${id}/status`,
      data,
    ),
  addFollowUp: (id: string, data: FollowUpInput) =>
    apiClient.post<ApplicationRead>(
      `${applicationsApi.applicationBaseUrl}/${id}/follow-ups`,
      data,
    ),
  list: (params: ListParams = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.limit !== undefined) query.set("limit", String(params.limit));
    if (params.offset !== undefined) {
      query.set("offset", String(params.offset));
    }
    const queryString = query.toString();
    return apiClient.get<PaginatedList<ApplicationSummary>>(
      `${applicationsApi.applicationBaseUrl}${queryString ? `?${queryString}` : ""}`,
    );
  },
  // The API has no sort parameter, so the list page loads every row
  // (up to MAX_ROWS) and sorts and pages them in the browser.
  listAll: async (status?: ApplicationStatus) => {
    const items: ApplicationSummary[] = [];
    let total: number;
    do {
      const page = await applicationsApi.list({
        status,
        limit: FETCH_PAGE_SIZE,
        offset: items.length,
      });
      items.push(...page.items);
      total = page.total;
      if (page.items.length === 0) break;
    } while (items.length < total && items.length < MAX_ROWS);
    return { items, total, truncated: items.length < total };
  },
  remove: (id: string) =>
    apiClient.delete(`${applicationsApi.applicationBaseUrl}/${id}`),
};
