import { ApiError } from "@/shared/libs/apiClient";
import { AnthropicError } from "./byok/anthropic";

export type ParseMethod = "link" | "refresha" | "own";

const GENERIC = "Couldn't read that posting. Try again in a moment.";

export function parseErrorMessage(error: unknown, method: ParseMethod): string {
  if (error instanceof AnthropicError) {
    if (error.status === 0) {
      return "Couldn't reach Anthropic. Check your connection and try again.";
    }
    if (error.status === 401 || error.status === 403) {
      return "Anthropic rejected that key. Check it, or remove it and add it again.";
    }
    if (error.status === 429) {
      return "Anthropic is rate limiting this key. Wait a moment and try again.";
    }
    if (error.status === 402 || /credit|billing/i.test(error.message)) {
      return "That Anthropic account has no credit left.";
    }
    return `Anthropic couldn't parse that: ${error.message.slice(0, 160)}`;
  }

  if (error instanceof ApiError) {
    if (error.status === 402 || error.status === 403) {
      return "Parsing with Refresha's AI is part of Pro. Upgrade, or use your own key.";
    }
    if (error.status === 422) {
      return method === "link"
        ? "Enter a full link, starting with https://"
        : "Paste at least 50 characters of the job posting.";
    }
    if (error.status === 429) return "Too many requests. Wait a moment and try again.";
    if (error.status >= 500) return "Something went wrong on our side. Try again in a moment.";
    if (typeof error.detail === "string" && error.detail.length <= 200) {
      return error.detail;
    }
  }

  if (error instanceof Error && !(error instanceof ApiError)) {
    return error.message || GENERIC;
  }
  return GENERIC;
}
