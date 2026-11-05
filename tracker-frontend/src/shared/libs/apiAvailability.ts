import { ApiError } from "./apiClient";

// The API answers these when it has no such endpoint (yet): not found, method
// not allowed, not implemented. Screens use it to say "not available" instead
// of blaming the user's input or connection.
export function isUnavailable(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 404 || error.status === 405 || error.status === 501)
  );
}

export const UNAVAILABLE_MESSAGE =
  "This isn't available right now. Please try again later.";
