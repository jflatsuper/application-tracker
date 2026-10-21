import { Navigate, Outlet } from "react-router";
import { useAuth } from "./useAuth";

export function ProtectedRoute() {
  const { status } = useAuth();
  return status === "authenticated" ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
}
