import { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { GlobalLogoLoader } from "../../components/ui/GlobalLogoLoader";
import { useAuth } from "../../features/auth/AuthContext";

export const ProtectedRoute = ({ children }: { children?: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <GlobalLogoLoader message="Checking your session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children ? <>{children}</> : <Outlet />;
};
