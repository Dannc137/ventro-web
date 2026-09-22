import { Navigate, Outlet, useLocation, type Location } from "react-router";
import { AppShellSkeleton } from "@/components/shared/app-shell-skeleton";
import { AuthPageSkeleton } from "@/components/shared/auth-page-skeleton";
import { useAuth } from "./auth-context";

const DEFAULT_REDIRECT = "/events";

function redirectTarget(location: Location): string {
  const state = location.state as { from?: string } | null;
  return state?.from ?? DEFAULT_REDIRECT;
}

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <AppShellSkeleton />;
  }

  if (status === "anonymous") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <AuthPageSkeleton />;
  }

  if (status === "authenticated") {
    return <Navigate to={redirectTarget(location)} replace />;
  }

  return <Outlet />;
}