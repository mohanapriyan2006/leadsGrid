import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "./shell/AppShell";
import { RouteSkeleton } from "./views/RouteSkeleton";

const DashboardPage = lazy(() =>
  import("./views/DashboardPage").then((module) => ({ default: module.DashboardPage }))
);
const LandingPage = lazy(() =>
  import("./views/LandingPage").then((module) => ({ default: module.LandingPage }))
);
const LeadsPage = lazy(() =>
  import("./views/LeadsPage").then((module) => ({ default: module.LeadsPage }))
);
const MessagesPage = lazy(() =>
  import("./views/MessagesPage").then((module) => ({ default: module.MessagesPage }))
);
const CRMPage = lazy(() =>
  import("./views/CRMPage").then((module) => ({ default: module.CRMPage }))
);
const AIPage = lazy(() =>
  import("./views/AIPage").then((module) => ({ default: module.AIPage }))
);
const SettingsPage = lazy(() =>
  import("./views/SettingsPage").then((module) => ({ default: module.SettingsPage }))
);

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<RouteSkeleton />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: withSuspense(<LandingPage />),
  },
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        path: "dashboard",
        element: withSuspense(<DashboardPage />),
      },
      {
        path: "leads",
        element: withSuspense(<LeadsPage />),
      },
      {
        path: "messages",
        element: withSuspense(<MessagesPage />),
      },
      {
        path: "crm",
        element: withSuspense(<CRMPage />),
      },
      {
        path: "ai",
        element: withSuspense(<AIPage />),
      },
      {
        path: "settings",
        element: withSuspense(<SettingsPage />),
      },
    ],
  },
]);
