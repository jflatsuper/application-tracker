import { Link } from "react-router";
import { useAuth } from "@/features/auth/hooks/useAuth";
import Icon from "@/shared/components/Icon";

const GuestBanner = () => {
  const { status, user } = useAuth();
  if (status !== "authenticated" || !user?.is_anonymous) return null;

  return (
    <div className="guest-banner">
      <Icon name="info" size={18} />
      <span>
        You're browsing as a guest. Create an account to keep your
        applications.
      </span>
      <Link to="/register" className="guest-banner__link">
        Sign up
      </Link>
    </div>
  );
};

export default GuestBanner;
