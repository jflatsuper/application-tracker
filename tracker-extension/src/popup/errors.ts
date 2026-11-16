import { ApiError } from "../shared/api";

const wait = (seconds: number) =>
  seconds < 60
    ? `${Math.max(1, Math.ceil(seconds))} seconds`
    : `${Math.ceil(seconds / 60)} minutes`;

// One plain sentence for whatever went wrong.
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return "Couldn't reach Refresha. Check your connection and try again.";
    }
    if (error.status === 429) {
      return error.retryAfter === undefined
        ? "Too many requests. Wait a moment and try again."
        : `Too many requests. Try again in ${wait(error.retryAfter)}.`;
    }
    if (error.status === 402 || error.status === 403) {
      return "That part of Refresha is part of Pro.";
    }
    if (error.status >= 500) {
      return "Something went wrong on our side. Try again in a moment.";
    }
  }
  return "Something went wrong. Try again.";
}
