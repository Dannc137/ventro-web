import { Navigate, Outlet, useLocation } from "react-router";
import { AppShellSkeleton } from "@/components/shared/app-shell-skeleton";
import { AuthPageSkeleton } from "@/components/shared/auth-page-skeleton";
import { useAuth } from "./auth-context";

export function ProtectedRoute() {
  const { status } = useAuth();

  if (status === "loading") {
    return <AppShellSkeleton />;
  }

  if (status === "anonymous") {
    return <Navigate to="/login" replace />;
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
    const state = location.state as { inviteToken?: string } | null;
    const token = state?.inviteToken;

    return <Navigate to={token ? `/invite/${token}` : "/events"} replace />;
  }

  return <Outlet />;
}