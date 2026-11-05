import { useLocation } from "react-router";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useResendVerification } from "@/features/auth/hooks/useResendVerification";
import { needsEmailVerification } from "@/features/auth/verification";
import Icon from "@/shared/components/Icon";

// Asks signed-in people to confirm their address, with a way to get a new link.
const VerifyEmailBanner = () => {
  const { status, user } = useAuth();
  const { pathname } = useLocation();
  const resend = useResendVerification();

  if (status !== "authenticated" || !needsEmailVerification(user)) return null;
  // The verification page says all this already.
  if (pathname.startsWith("/verify-email")) return null;

  return (
    <div className="guest-banner guest-banner--verify">
      <Icon name="alert-triangle" size={18} />
      <span>
        Confirm your email address. We sent a link to <strong>{user?.email}</strong>.
      </span>
      <button
        type="button"
        className="guest-banner__link"
        disabled={resend.isPending}
        onClick={() => resend.mutate()}
      >
        {resend.isPending ? "Sending…" : "Resend email"}
      </button>
    </div>
  );
};

export default VerifyEmailBanner;
