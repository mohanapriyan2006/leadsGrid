import { lazy, Suspense, type ReactNode } from "react";
import { Link, Navigate, createBrowserRouter } from "react-router-dom";

import { AppShell } from "./shell/AppShell";
import { ProtectedRoute } from "./shell/ProtectedRoute";
import { LoginPage } from "./views/LoginPage";
import { RouteErrorPage } from "./views/RouteErrorPage";
import { RouteSkeleton } from "./views/RouteSkeleton";
import { GlobalLogoLoader } from "../components/ui/GlobalLogoLoader";
import { useAuth } from "../features/auth/AuthContext";
import notFound from "../assets/not-found.png";

const DashboardPage = lazy(() =>
  import("./views/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);
const LandingPage = lazy(() =>
  import("./views/LandingPage").then((module) => ({
    default: module.LandingPage,
  })),
);
const LeadsDiscoveryPage = lazy(() =>
  import("./views/LeadsDiscoveryPage").then((module) => ({
    default: module.LeadsDiscoveryPage,
  })),
);
const ManageLeadsPage = lazy(() =>
  import("./views/ManageLeadsPage").then((module) => ({
    default: module.ManageLeadsPage,
  })),
);
const RecyclicBinPage = lazy(() =>
  import("./views/RecyclicBinPage").then((module) => ({
    default: module.RecyclicBinPage,
  })),
);
const MessagesPage = lazy(() =>
  import("./views/MessagesPage").then((module) => ({
    default: module.MessagesPage,
  })),
);
const CRMPage = lazy(() =>
  import("./views/CRMPage").then((module) => ({ default: module.CRMPage })),
);
const AIPage = lazy(() =>
  import("./views/AIPage").then((module) => ({ default: module.AIPage })),
);
const SettingsPage = lazy(() =>
  import("./views/SettingsPage").then((module) => ({
    default: module.SettingsPage,
  })),
);
const AboutPage = lazy(() =>
  import("./views/AboutPage").then((module) => ({
    default: module.AboutPage,
  })),
);
const ContactPage = lazy(() =>
  import("./views/ContactPage").then((module) => ({
    default: module.ContactPage,
  })),
);
const PrivacyPage = lazy(() =>
  import("./views/PrivacyPage").then((module) => ({
    default: module.PrivacyPage,
  })),
);
const TermsPage = lazy(() =>
  import("./views/TermsPage").then((module) => ({
    default: module.TermsPage,
  })),
);

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<RouteSkeleton />}>{element}</Suspense>
);

const HomeRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <GlobalLogoLoader message="Checking your session..." />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return withSuspense(<LandingPage />);
};

const LoginRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <GlobalLogoLoader message="Checking your session..." />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginPage />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeRoute />,
    errorElement: <RouteErrorPage title="Unable to open landing page" />,
  },
  {
    path: "/login",
    element: <LoginRoute />,
    errorElement: <RouteErrorPage title="Unable to open login" />,
  },
  {
    path: "/about",
    element: withSuspense(<AboutPage />),
    errorElement: <RouteErrorPage title="Unable to open about" />,
  },
  {
    path: "/contact",
    element: withSuspense(<ContactPage />),
    errorElement: <RouteErrorPage title="Unable to open contact" />,
  },
  {
    path: "/privacy",
    element: withSuspense(<PrivacyPage />),
    errorElement: <RouteErrorPage title="Unable to open privacy" />,
  },
  {
    path: "/terms",
    element: withSuspense(<TermsPage />),
    errorElement: <RouteErrorPage title="Unable to open terms" />,
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
          <img
            src={notFound}
            alt="Not found"
            className="mx-auto mb-6 w-48 h-48 object-contain opacity-90"
          />
          <h1 className="text-4xl font-bold text-accent mb-4">404</h1>
          <p className="text-content-secondary mb-6">Page not found</p>
          <Link
            to="/"
            className="text-accent hover:text-accent-secondary transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    ),
  },
]);
