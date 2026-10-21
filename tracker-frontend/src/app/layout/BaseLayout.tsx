import { Outlet } from "react-router";
import DefaultHeader from "./headers/DefaultHeader";
import GuestBanner from "./GuestBanner";
import "./style.scss";

const BaseLayout = () => {
  return (
    <div className="base-layout">
      <GuestBanner />
      <DefaultHeader />
      <main className="base-layout__main">
        <Outlet />
      </main>
    </div>
  );
};

export default BaseLayout;
