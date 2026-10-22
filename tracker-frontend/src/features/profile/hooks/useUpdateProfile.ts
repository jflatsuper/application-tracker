import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { authApi } from "@/features/auth/api/authApi";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function useUpdateProfile() {
  const { setUser } = useAuth();
  return useMutation({
    mutationFn: authApi.updateMe,
    onSuccess: (user) => {
      setUser(user);
      toast.success("Profile updated");
    },
  });
}
