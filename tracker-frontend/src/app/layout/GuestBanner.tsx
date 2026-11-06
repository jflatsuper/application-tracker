import { useAuth } from "@/features/auth/hooks/useAuth";
import Banner from "@/shared/components/banner";
import Button from "@/shared/components/button";

const GuestBanner = () => {
  const { status, user } = useAuth();
  if (status !== "authenticated" || !user?.is_anonymous) return null;

  return (
    <Banner
      icon="info"
      action={
        <Button to="/register" size="sm">
          Sign up
        </Button>
      }
    >
      You're browsing as a guest. Create an account to keep your applications.
    </Banner>
  );
};

export default GuestBanner;
