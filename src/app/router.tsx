import { createBrowserRouter, Navigate } from "react-router";
import { NotFoundPage } from "@/components/shared/not-found-page";
import { RouteErrorPage } from "@/components/shared/route-error-page";
import { LoginPage, ProtectedRoute, PublicOnlyRoute, RegisterPage } from "@/features/auth";
import { EventsPage } from "@/features/events/pages/events-page";

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <PublicOnlyRoute />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/events", element: <EventsPage /> },
        ],
      },
      { path: "/", element: <Navigate to="/events" replace /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);