import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api-client";
import { formatLongDate } from "@/lib/format";
import type { EventDetail } from "../types";
import { useUncancelEvent } from "../hooks";

export function CancelledBanner({ event }: { event: EventDetail }) {
  const uncancel = useUncancelEvent(event.id);
  const isOwner = event.myRole === "OWNER";

  if (event.status !== "CANCELLED") return null;

  function handleRestore() {
    uncancel.mutate(undefined, {
      onSuccess: () => toast.success("Event restored"),
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive-tint px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-destructive-strong">
            This event was cancelled
            {event.cancelledAt ? ` on ${formatLongDate(event.cancelledAt)}` : ""}
            {event.cancelledByName ? ` by ${event.cancelledByName}` : ""}
          </p>
          {event.cancelReason && (
            <p className="mt-1 text-sm text-foreground-soft">{event.cancelReason}</p>
          )}
          <p className="mt-1.5 text-xs text-muted-foreground">
            Everything here is read-only. Nothing has been deleted.
          </p>
        </div>

        {isOwner && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestore}
            disabled={uncancel.isPending}
            className="shrink-0"
          >
            {uncancel.isPending ? "Restoring…" : "Restore event"}
          </Button>
        )}
      </div>
    </div>
  );
}