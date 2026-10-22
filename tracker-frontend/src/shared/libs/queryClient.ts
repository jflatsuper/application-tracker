// shared/libs/queryClient.ts
import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./apiClient";

const MAX_RETRIES = 3;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500
        ) {
          return false;
        }
        return failureCount < MAX_RETRIES;
      },
    },
  },
});
