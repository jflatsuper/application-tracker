import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { authApi } from "../api/authApi";
import { authFlowErrorMessage } from "../errors";

export function useResendVerification() {
  return useMutation({
    mutationFn: authApi.resendVerification,
    onSuccess: () => toast.success("Verification email sent"),
    onError: (error) => toast.error(authFlowErrorMessage(error, "resend")),
  });
}
