import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { authApi } from "@/features/auth/api/authApi";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { downloadJson } from "@/shared/libs/download";

export function useExportData() {
  return useMutation({
    mutationFn: authApi.exportData,
    onSuccess: (data) => {
      const day = new Date().toISOString().slice(0, 10);
      downloadJson(`refresha-export-${day}.json`, data);
      toast.success("Your data was downloaded");
    },
  });
}

export function useDeleteAccount() {
  const { logout } = useAuth();
  return useMutation({
    mutationFn: authApi.deleteAccount,
    onSuccess: async () => {
      // Same as signing out: protected pages send you to the login page.
      await logout();
      toast.success("Your account was deleted");
    },
  });
}
