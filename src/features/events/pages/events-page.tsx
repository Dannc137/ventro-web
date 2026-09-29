import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CountdownPill } from "@/components/shared/countdown-pill";
import { EmptyState } from "@/components/shared/empty-state";
import { RoleBadge } from "@/components/shared/role-badge";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { CreateEventDialog } from "../components/create-event-dialog";
import { useEvents } from "../hooks";

export function EventsPage() {
  const { data: events, isLoading, isError, error } = useEvents();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl leading-tight font-semibold tracking-tight">
          My events
        </h1>
        <Button onClick={() => setCreateOpen(true)}>New event</Button>
      </div>

      <div className="mt-8">
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-lg" />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-lg border bg-destructive-tint px-4 py-3 text-sm text-destructive-strong">
            {getErrorMessage(error)}
          </div>
        )}

        {events?.length === 0 && (
          <EmptyState
            title="No events yet"
            description="Create your first event and invite the people helping you plan it."
            action={
              <Button variant="outline" onClick={() => setCreateOpen(true)}>
                New event
              </Button>
            }
          />
        )}

        {events && events.length > 0 && (
          <div className="grid auto-rows-min gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="flex flex-col rounded-lg border bg-card p-5 transition-colors hover:border-border-strong focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="truncate text-[15px] leading-tight font-semibold">
                    {event.name}
                  </h2>
                  <CountdownPill days={event.daysUntil} />
                </div>

                <p className="mt-1.5 truncate text-xs text-muted-foreground">
                  {formatDate(event.eventDate)}
                  {event.venue ? ` · ${event.venue}` : ""}
                </p>

                <div className="mt-5">
                  <RoleBadge role={event.myRole} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <CreateEventDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}