import { useLocation } from "react-router";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useResendVerification } from "@/features/auth/hooks/useResendVerification";
import { needsEmailVerification } from "@/features/auth/verification";
import Banner from "@/shared/components/banner";
import Button from "@/shared/components/button";

// Asks signed-in people to confirm their address, with a way to get a new link.
const VerifyEmailBanner = () => {
  const { status, user } = useAuth();
  const { pathname } = useLocation();
  const resend = useResendVerification();

  if (status !== "authenticated" || !needsEmailVerification(user)) return null;
  // The verification page says all this already.
  if (pathname.startsWith("/verify-email")) return null;

  return (
    <Banner
      tone="warning"
      icon="alert-triangle"
      action={
        <Button
          size="sm"
          disabled={resend.isPending}
          onClick={() => resend.mutate()}
        >
          {resend.isPending ? "Sending…" : "Resend email"}
        </Button>
      }
    >
      Confirm your email address. We sent a link to{" "}
      <strong>{user?.email}</strong>.
    </Banner>
  );
};

export default VerifyEmailBanner;
