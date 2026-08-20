import { Outlet } from "react-router";

const BaseLayout = () => {
  return (
    <div>
      <h1>BaseLayout</h1>
      <Outlet />
    </div>
  );
};

export default BaseLayout;
