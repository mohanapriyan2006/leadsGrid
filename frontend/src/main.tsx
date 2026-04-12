import { Fragment, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthContext";

import { router } from "./app/router";
import "./styles/globals.css";

const queryClient = new QueryClient();
const RootWrapper = import.meta.env.DEV ? Fragment : StrictMode;

createRoot(document.getElementById("root")!).render(
  <RootWrapper>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </RootWrapper>
);
