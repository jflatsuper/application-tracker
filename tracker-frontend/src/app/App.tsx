import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { queryClient } from "@/shared/libs/queryClient";
import { router } from "./router";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastContainer autoClose={4000} />
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
