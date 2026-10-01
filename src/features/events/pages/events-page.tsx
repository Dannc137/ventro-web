import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CountdownPill } from "@/components/shared/countdown-pill";
import { EmptyState } from "@/components/shared/empty-state";
import { RoleBadge } from "@/components/shared/role-badge";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CreateEventDialog } from "../components/create-event-dialog";
import { useEvents } from "../hooks";
import type { EventCard as EventCardType } from "../types";

type Filter = "upcoming" | "past" | "archived" | "cancelled";

export function EventsPage() {
  const { data: events, isLoading, isError, error } = useEvents();

  const [createOpen, setCreateOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const all = events ?? [];
    return {
      upcoming: all.filter((e) => e.status === "ACTIVE" && e.daysUntil >= 0).length,
      past: all.filter((e) => e.status === "ACTIVE" && e.daysUntil < 0).length,
      archived: all.filter((e) => e.status === "ARCHIVED").length,
      cancelled: all.filter((e) => e.status === "CANCELLED").length,
    };
  }, [events]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    return (events ?? [])
      .filter((event) => {
        if (filter === "archived") return event.status === "ARCHIVED";
        if (filter === "cancelled") return event.status === "CANCELLED";
        if (event.status !== "ACTIVE") return false;
        return filter === "upcoming" ? event.daysUntil >= 0 : event.daysUntil < 0;
      })
      .filter(
        (event) =>
          term === "" ||
          event.name.toLowerCase().includes(term) ||
          (event.venue ?? "").toLowerCase().includes(term),
      )
      .sort((a, b) =>
        filter === "past" ? b.daysUntil - a.daysUntil : a.daysUntil - b.daysUntil,
      );
  }, [events, filter, search]);

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl leading-tight font-semibold tracking-tight">
          My events
        </h1>
        <Button onClick={() => setCreateOpen(true)}>New event</Button>
      </div>

      <div className="mt-6 space-y-3 sm:flex sm:flex-wrap sm:items-center sm:gap-3 sm:space-y-0">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="upcoming" className="flex-1 sm:flex-none">
              Upcoming
              {counts.upcoming > 0 && (
                <span className="ml-1.5 text-xs tabular-nums opacity-60">
                  {counts.upcoming}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="past" className="flex-1 sm:flex-none">
              Past
              {counts.past > 0 && (
                <span className="ml-1.5 text-xs tabular-nums opacity-60">
                  {counts.past}
                </span>
              )}
            </TabsTrigger>
            {counts.archived > 0 && (
              <TabsTrigger value="archived" className="flex-1 sm:flex-none">
                Archived
                <span className="ml-1.5 text-xs tabular-nums opacity-60">
                  {counts.archived}
                </span>
              </TabsTrigger>
            )}
            {counts.cancelled > 0 && (
              <TabsTrigger value="cancelled" className="flex-1 sm:flex-none">
                Cancelled
                <span className="ml-1.5 text-xs tabular-nums opacity-60">
                  {counts.cancelled}
                </span>
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:ml-auto sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search events"
            placeholder="Search events"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="mt-6">
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-lg" />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-lg border bg-destructive-tint px-4 py-3 text-sm text-destructive-strong">
            {getErrorMessage(error)}
          </div>
        )}

        {events && events.length === 0 && (
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

        {events && events.length > 0 && visible.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {search
              ? "No events match your search."
              : filter === "past"
                ? "No past events yet."
                : filter === "archived"
                  ? "Nothing archived."
                  : filter === "cancelled"
                    ? "Nothing cancelled."
                    : "No upcoming events."}
          </p>
        )}

        {visible.length > 0 && (
          <div className="grid auto-rows-min gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      <CreateEventDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}

function EventCard({ event }: { event: EventCardType }) {
  const dimmed =
    event.status === "ARCHIVED" ||
    event.status === "CANCELLED" ||
    event.daysUntil < 0;

  return (
    <Link
      to={`/events/${event.id}`}
      className={cn(
        "flex min-w-0 flex-col rounded-lg border bg-card p-5 transition-colors hover:border-border-strong focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none",
        dimmed && "bg-background",
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <h2
          className={cn(
            "min-w-0 flex-1 truncate text-[15px] leading-tight font-semibold",
            dimmed && "text-foreground-soft",
          )}
        >
          {event.name}
        </h2>
        <CountdownPill days={event.daysUntil} />
      </div>

      <p className="mt-1.5 truncate text-xs text-muted-foreground">
        {formatDate(event.eventDate)}
        {event.venue ? ` · ${event.venue}` : ""}
      </p>

            <div className="mt-5 flex items-center gap-2">
        <RoleBadge role={event.myRole} />
        {event.status === "ARCHIVED" && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Archived
          </span>
        )}
        {event.status === "CANCELLED" && (
          <span className="rounded-full bg-destructive-tint px-2 py-0.5 text-xs text-destructive-strong">
            Cancelled
          </span>
        )}
      </div>
    </Link>
  );
}