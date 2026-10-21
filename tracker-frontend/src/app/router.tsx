import { createBrowserRouter } from "react-router";
import ApplicationsListPage from "@/features/applications/pages/ApplicationsListPage";
import CreateApplicationPage from "@/features/applications/pages/CreateApplicationPage";
import EditApplicationPage from "@/features/applications/pages/EditApplicationPage";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { AuthComplete } from "@/features/auth/pages/Complete";
import Login from "@/features/auth/pages/Login";
import Register from "@/features/auth/pages/Register";
import PricingPage from "@/features/billing/pages/PricingPage";
import HomePage from "@/features/home/pages/HomePage";
import AccountPage from "@/features/profile/pages/AccountPage";
import BillingPage from "@/features/profile/pages/BillingPage";
import DeveloperPage from "@/features/profile/pages/DeveloperPage";
import ProfileLayout from "@/features/profile/pages/ProfileLayout";
import UsagePage from "@/features/profile/pages/UsagePage";
import NotFound from "./errors/NotFound";
import RouteError from "./errors/RouteError";
import BaseLayout from "./layout/BaseLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <BaseLayout />,
    errorElement: <RouteError standalone />,
    children: [
      {
        errorElement: <RouteError />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "login", element: <Login /> },
          { path: "register", element: <Register /> },
          { path: "pricing", element: <PricingPage /> },
          { path: "auth/complete", element: <AuthComplete /> },
          {
            element: <ProtectedRoute />,
            children: [
              {
                path: "applications",
                children: [
                  { index: true, element: <ApplicationsListPage /> },
                  { path: "create", element: <CreateApplicationPage /> },
                  { path: ":applicationId", element: <EditApplicationPage /> },
                ],
              },
              {
                path: "profile",
                element: <ProfileLayout />,
                children: [
                  { index: true, element: <AccountPage /> },
                  { path: "billing", element: <BillingPage /> },
                  { path: "usage", element: <UsagePage /> },
                  ...(import.meta.env.DEV
                    ? [{ path: "developer", element: <DeveloperPage /> }]
                    : []),
                ],
              },
            ],
          },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
]);
