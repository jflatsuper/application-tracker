import { ApiError } from "@/shared/libs/apiClient";
import { UNAVAILABLE_MESSAGE, isUnavailable } from "@/shared/libs/apiAvailability";
import { retryHint } from "@/shared/libs/retryAfter";

type AuthAction = "login" | "register";

export function authErrorMessage(error: unknown, action: AuthAction): string {
  if (!(error instanceof ApiError)) {
    return "Couldn't reach the server. Check your connection and try again.";
  }
  if (error.status === 422) {
    return "Check the highlighted fields and try again.";
  }
  if (error.status === 429) {
    return `Too many attempts. ${retryHint(error.retryAfter, "Wait a moment and try again.")}`;
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

export const VERIFY_LINK_INVALID =
  "This verification link is invalid or has expired. Request a new one.";

type FlowAction = "forgot" | "reset" | "verify" | "resend";

const NETWORK = "Couldn't reach the server. Check your connection and try again.";

// Messages for the password-reset and email-verification screens.
export function authFlowErrorMessage(error: unknown, action: FlowAction): string {
  if (!(error instanceof ApiError)) return NETWORK;
  if (isUnavailable(error)) return UNAVAILABLE_MESSAGE;
  if (error.status === 429) {
    return `Too many attempts. ${retryHint(error.retryAfter, "Wait a moment and try again.")}`;
  }
  if (error.status >= 500) {
    return "Something went wrong on our side. Try again in a moment.";
  }
  switch (action) {
    case "forgot":
      return "Enter a valid email address and try again.";
    case "reset":
      return "This reset link is invalid or has expired. Request a new one.";
    case "verify":
      return VERIFY_LINK_INVALID;
    case "resend":
      return "Couldn't send the email. Try again in a moment.";
  }
}
