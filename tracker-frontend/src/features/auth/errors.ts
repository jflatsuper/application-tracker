import { ApiError } from "@/shared/libs/apiClient";

type AuthAction = "login" | "register";

export function authErrorMessage(error: unknown, action: AuthAction): string {
  if (!(error instanceof ApiError)) {
    return "Couldn't reach the server. Check your connection and try again.";
  }
  if (error.status === 422) {
    return "Check the highlighted fields and try again.";
  }
  if (error.status === 429) {
    return "Too many attempts. Wait a moment and try again.";
  }
  if (error.status >= 500) {
    return "Something went wrong on our side. Try again in a moment.";
  }
  if (action === "register" && (error.status === 400 || error.status === 409)) {
    return "An account with that email already exists. Try signing in instead.";
  }
  if (action === "login") {
    return "That email and password don't match. Check them and try again.";
  }
  return "Couldn't create your account. Check your details and try again.";
}
