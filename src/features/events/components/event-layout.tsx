import { useState } from "react";
import axios from "axios";
import { Link, NavLink, Outlet, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api-client";
import { formatCountdown, formatLongDate } from "@/lib/format";
import { can, type Permission } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { ShareClientDialog } from "./share-client-dialog";
import { useEvent } from "../hooks";

const TABS: {
  to: string;
  label: string;
  permission: Permission;
  end: boolean;
}[] = [
  { to: "", label: "Dashboard", permission: "VIEW_EVENT", end: true },
  { to: "tasks", label: "Tasks", permission: "VIEW_TASKS", end: false },
  { to: "budget", label: "Budget", permission: "EDIT_BUDGET", end: false },
  { to: "money", label: "Money", permission: "VIEW_MONEY", end: false },
  { to: "members", label: "Members", permission: "MANAGE_MEMBERS", end: false },
  { to: "activity", label: "Activity", permission: "VIEW_EVENT", end: false },
  { to: "settings", label: "Settings", permission: "EDIT_EVENT", end: false },
];

export function EventLayout() {
  const { eventId = "" } = useParams();
  const { data: event, isLoading, isError, error } = useEvent(eventId);

  const [shareOpen, setShareOpen] = useState(false);

  if (isError) {
    const notFound = axios.isAxiosError(error) && error.response?.status === 404;

    return (
      <div className="flex flex-col items-center rounded-lg border border-dashed px-6 py-16 text-center">
        <h2 className="text-[15px] font-semibold">
          {notFound ? "You don't have access to this event" : "Couldn't load this event"}
        </h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {notFound
            ? "It may have been deleted, or you may need an invite from the organiser."
            : getErrorMessage(error)}
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/events">Back to my events</Link>
        </Button>
      </div>
    );
  }

  const visibleTabs = TABS.filter((tab) => can(event?.permissions, tab.permission));

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="mt-2 h-4 w-48" />
            </>
          ) : (
            <>
              <h1 className="truncate text-2xl leading-tight font-semibold tracking-tight">
                {event?.name}
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                {event && formatLongDate(event.eventDate)}
                {event?.venue ? ` · ${event.venue}` : ""}
              </p>
            </>
          )}
        </div>

        {event && (
          <div className="flex items-center gap-3">
            <p className="text-base font-semibold tabular-nums">
              {formatCountdown(event.daysUntil)}
            </p>
            {can(event.permissions, "EDIT_EVENT") && (
              <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}>
                Share client view
              </Button>
            )}
          </div>
        )}
      </div>

      <nav className="scrollbar-none mt-6 flex items-center gap-6 overflow-x-auto overflow-y-hidden border-b">
        {visibleTabs.map((tab) => (
          <NavLink
            key={tab.label}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                "-mb-px shrink-0 border-b-2 pb-3 text-sm font-medium transition-colors",
                "focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}

        <Link
          to="/events"
          className="ml-auto shrink-0 rounded-md pb-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
        >
          All events
        </Link>
      </nav>

      <div className="mt-6">
        <Outlet context={event} />
      </div>

      {event && (
        <ShareClientDialog
          eventName={event.name}
          open={shareOpen}
          onOpenChange={setShareOpen}
        />
      )}
    </>
  );
}