import { useState } from "react";
import axios from "axios";
import { Link, Outlet, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api-client";
import { formatCountdown, formatLongDate } from "@/lib/format";
import { can } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { ShareClientDialog } from "./share-client-dialog";
import { useEvent } from "../hooks";
import { useEventRealtime } from "@/features/realtime/use-event-realtime";
import { CancelledBanner } from "./cancelled-banner";
import { ChatLauncher } from "@/features/chat/components/chat-launcher";
import { ChatPanel } from "@/features/chat/components/chat-panel";

export function EventLayout() {
  const { eventId = "" } = useParams();
  const { data: event, isLoading, isError, error } = useEvent(eventId);

  const [shareOpen, setShareOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  useEventRealtime(eventId);

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

  return (
    <div
      className={cn(
        "transition-[padding] duration-200 ease-out motion-reduce:transition-none",
        chatOpen && "sm:pr-[360px]",
      )}
    >
      {event?.status === "CANCELLED" && (
        <div className="mb-6">
          <CancelledBanner event={event} />
        </div>
      )}
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
            {can(event, "EDIT_EVENT") && (
              <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}>
                Share client view
              </Button>
            )}
          </div>
        )}
      </div>

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

      {eventId && (
        <>
          <ChatLauncher eventId={eventId} open={chatOpen} onOpen={() => setChatOpen(true)} />
          <ChatPanel eventId={eventId} open={chatOpen} onOpenChange={setChatOpen} />
        </>
      )}
    </div>
  );
}