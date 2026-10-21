import { Navigate } from "react-router";
import { useAuth } from "@/auth/useAuth";

function Login() {
  const { status, user, login, loginWithProvider } = useAuth();

  if (status === "authenticated" && user && !user.is_anonymous) {
    return <Navigate to="/applications" replace />;
  }

  return (
    <>
      {/* email/password form calling login(...) */}
      <button type="button" onClick={() => loginWithProvider("google")}>
        Continue with Google
      </button>
      <button type="button" onClick={() => loginWithProvider("linkedin")}>
        Continue with LinkedIn
      </button>
    </>
  );
}
export default Login;
