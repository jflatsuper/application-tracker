import { Outlet } from "react-router";
import DefaultHeader from "./headers/DefaultHeader";
import Footer from "./Footer";
import GuestBanner from "./GuestBanner";
import AnnouncementBanner from "@/features/notifications/components/AnnouncementBanner";
import "./style.scss";

const BaseLayout = () => {
  return (
    <div className="base-layout">
      <GuestBanner />
      <AnnouncementBanner />
      <DefaultHeader />
      <main className="base-layout__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default BaseLayout;
