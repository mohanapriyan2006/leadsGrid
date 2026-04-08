import { lazy, Suspense, type ReactNode } from "react";
import { Link, createBrowserRouter } from "react-router-dom";

import { AppShell } from "./shell/AppShell";
import { ProtectedRoute } from "./shell/ProtectedRoute";
import { LoginPage } from "./views/LoginPage";
import { RouteErrorPage } from "./views/RouteErrorPage";
import { RouteSkeleton } from "./views/RouteSkeleton";

const DashboardPage = lazy(() =>
  import("./views/DashboardPage").then((module) => ({ default: module.DashboardPage }))
);
const LandingPage = lazy(() =>
  import("./views/LandingPage").then((module) => ({ default: module.LandingPage }))
);
const LeadsDiscoveryPage = lazy(() =>
  import("./views/LeadsDiscoveryPage").then((module) => ({ default: module.LeadsDiscoveryPage }))
);
const ManageLeadsPage = lazy(() =>
  import("./views/ManageLeadsPage").then((module) => ({ default: module.ManageLeadsPage }))
);
const RecyclicBinPage = lazy(() =>
  import("./views/RecyclicBinPage").then((module) => ({ default: module.RecyclicBinPage }))
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
    errorElement: <RouteErrorPage title="Unable to open landing page" />,
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorPage title="Unable to open login" />,
  },
  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorPage title="Unable to navigate right now" />,
    children: [
      {
        path: "dashboard",
        element: withSuspense(<DashboardPage />),
      },
      {
        path: "leads-discovery",
        element: withSuspense(<LeadsDiscoveryPage />),
      },
      {
        path: "manage-leads",
        element: withSuspense(<ManageLeadsPage />),
      },
      {
        path: "recycle-bin",
        element: withSuspense(<RecyclicBinPage />),
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
  {
    path: "*",
    element: (
      <div className="min-h-screen flex items-center justify-center bg-surface text-content">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-accent mb-4">404</h1>
          <p className="text-content-secondary mb-6">Page not found</p>
          <Link to="/" className="text-accent hover:text-accent-secondary transition-colors">
            Go home
          </Link>
        </div>
      </div>
    ),
  },
]);
