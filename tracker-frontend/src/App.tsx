import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./pages/Home";
import Test from "./pages/Test";
import BaseLayout from "./shared/components/layouts/BaseLayout";
import Application from "./pages/applications/Application";
import ApplicationsListPage from "./pages/applications/ApplicationsList";

function App() {
  const queryClient = new QueryClient();
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
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
