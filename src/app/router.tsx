import { createBrowserRouter } from "react-router";
import { NotFoundPage } from "@/components/shared/not-found-page";
import { RouteErrorPage } from "@/components/shared/route-error-page";
import { LoginPage, ProtectedRoute, PublicOnlyRoute, RegisterPage } from "@/features/auth";
import { EventsPage } from "@/features/events/pages/events-page";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { ClientViewPage } from "@/features/public/pages/client-view-page";
import { EventLayout } from "@/features/events/components/event-layout";
import { TasksPage } from "@/features/tasks/pages/tasks-page";
import { BudgetPage } from "@/features/budget/pages/budget-page";
import { MoneyPage } from "@/features/money/pages/money-page";
import { ActivityPage } from "@/features/activity/pages/activity-page";
import { MembersPage } from "@/features/members/pages/members-page";
import { EventSettingsPage } from "@/features/events/pages/event-settings-page";
import { InvitePage } from "@/features/public/pages/invite-page";
import { LandingPage } from "@/features/public/pages/landing-page";

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    children: [
      { path: "/invite/:token", element: <InvitePage /> },
      { path: "/share/:token", element: <ClientViewPage /> },
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
          {
            element: <AppShell />,
            children: [
              { path: "/events", element: <EventsPage /> },
              {
                path: "/events/:eventId",
                element: <EventLayout />,
                children: [
                  { index: true, element: <DashboardPage /> },
                  { path: "tasks", element: <TasksPage /> },
                  { path: "budget", element: <BudgetPage /> },
                  { path: "money", element: <MoneyPage /> },
                  { path: "activity", element: <ActivityPage /> },
                  { path: "members", element: <MembersPage /> },
                  { path: "settings", element: <EventSettingsPage /> },
                ],
              },
            ],
          },
        ],
      },
      { path: "/", element: <LandingPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);