import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { useConsentState } from "@/shared/libs/consent";
import { trackPageView } from "@/shared/libs/googleTag";
import DefaultHeader from "./headers/DefaultHeader";
import Footer from "./Footer";
import CookieBanner from "./CookieBanner";
import CookieSettings from "./CookieSettings";
import GuestBanner from "./GuestBanner";
import VerifyEmailBanner from "./VerifyEmailBanner";
import AnnouncementBanner from "@/features/notifications/components/AnnouncementBanner";
import "./style.scss";

const BaseLayout = () => {
  // Child effects (which set the page title) run before this one, so the title
  // sent with the view is the new page's.
  // Accepting cookies on a page counts that page too, hence the dependency.
  const { pathname } = useLocation();
  const analytics = useConsentState().choices.analytics;
  useEffect(() => trackPageView(pathname), [pathname, analytics]);

  return (
    <div className="base-layout">
      <GuestBanner />
      <VerifyEmailBanner />
      <AnnouncementBanner />
      <DefaultHeader />
      <main className="base-layout__main">
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
      <CookieSettings />
    </div>
  );
};

export default BaseLayout;
