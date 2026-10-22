import { apiClient } from "@/shared/libs/apiClient";
import type { ParsedPosting, ParsePrompt } from "../types";

export const parserApi = {
  base: "/v1/applications/parse",
  // Free: the server reads the page's own structured data. No model call.
  url: (url: string) =>
    apiClient.post<ParsedPosting>(`${parserApi.base}/url`, { url }),
  // Uses the server's AI key, so it is part of the paid plan.
  text: (text: string) =>
    apiClient.post<ParsedPosting>(`${parserApi.base}/text`, { text }),
  // Prompt, schema and model for parsing in the browser with the user's key.
  prompt: () => apiClient.get<ParsePrompt>(`${parserApi.base}/prompt`),
};

export const TEXT_MIN = 50;
export const TEXT_MAX = 100000;
