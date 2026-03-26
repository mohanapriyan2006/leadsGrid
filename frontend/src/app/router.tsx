import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "./shell/AppShell";
import { RouteSkeleton } from "./views/RouteSkeleton";

const DashboardPage = lazy(() =>
  import("./views/DashboardPage").then((module) => ({ default: module.DashboardPage }))
);
const LeadsPage = lazy(() =>
  import("./views/LeadsPage").then((module) => ({ default: module.LeadsPage }))
);

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<RouteSkeleton />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: withSuspense(<DashboardPage />),
      },
      {
        path: "leads",
        element: withSuspense(<LeadsPage />),
      },
    ],
  },
]);
