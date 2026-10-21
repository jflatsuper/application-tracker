import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();
  return status === "authenticated" ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
}
