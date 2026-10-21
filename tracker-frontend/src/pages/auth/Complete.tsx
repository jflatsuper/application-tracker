// import { useAuth } from "@/auth/useAuth";
import { refreshAccessToken } from "@/shared/libs/apiClient";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export function AuthComplete() {
  const navigate = useNavigate();

  useEffect(() => {
    // The backend set the refresh cookie; trade it for an access token.
    refreshAccessToken().then((ok) =>
      navigate(ok ? "/" : "/login?error=signin_failed", { replace: true }),
    );
  }, [navigate]);

  return <p>Signing you in…</p>;
}
