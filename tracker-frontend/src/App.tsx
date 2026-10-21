import { QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./pages/Home";
import Test from "./pages/Test";
import BaseLayout from "./shared/components/layouts/BaseLayout";
import Application from "./pages/applications/Application";
import ApplicationsListPage from "./pages/applications/ApplicationsList";
import { queryClient } from "./shared/libs/queryClient";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./auth/AuthProvider";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import { AuthComplete } from "./pages/auth/Complete";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <BaseLayout />,
      loader: () => {
        return {
          message: "Hello from loader",
        };
      },
      action: async () => {
        return {
          message: "Hello from action",
        };
      },
      children: [
        { index: true, element: <Home /> },
        { path: "login", element: <Login /> },
        { path: "register", element: <Register /> },
        { path: "/auth/complete", element: <AuthComplete /> },
        {
          element: <ProtectedRoute />,
          children: [
            { path: "applications", element: <ApplicationsListPage /> },
            { path: "applications/create", element: <Application /> },
            { path: "products/:pid", element: <Test /> },
          ],
        },
        {
          path: "applications",
          children: [
            { element: <ApplicationsListPage />, index: true },
            { path: "create", element: <Application /> },
          ],
        },

        { path: "products/:pid", element: <Test /> },
      ],
    },
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastContainer autoClose={false} />
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
