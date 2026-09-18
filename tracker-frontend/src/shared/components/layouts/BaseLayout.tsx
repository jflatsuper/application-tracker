import { Outlet, useActionData, useLoaderData } from "react-router";
import DefaultHeader from "./headers/DefaultHeader";

const BaseLayout = () => {
  const { message } = useLoaderData();
  const actionData = useActionData();
  console.log(message);
  console.log(actionData);
  return (
    <div style={{ backgroundColor: "pink", height: "100vh" }}>
      <DefaultHeader />
      <Outlet />
    </div>
  );
};

export default BaseLayout;
