import { useState } from "react";
import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingDots } from "@/components/shared/loading-dots";
import { UserAvatar } from "@/components/shared/user-avatar";
import { getErrorMessage } from "@/lib/api-client";
import { formatRelativeTime } from "@/lib/format";
import { useActivity } from "../hooks";

const PAGE_SIZE = 25;
const MAX = 100;

export function ActivityPage() {
  const { eventId = "" } = useParams();
  const [limit, setLimit] = useState(PAGE_SIZE);
  const activity = useActivity(eventId, limit);

  if (activity.isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (activity.isError) {
    return (
      <div className="rounded-lg border bg-destructive-tint px-4 py-3 text-sm text-destructive-strong">
        {getErrorMessage(activity.error)}
      </div>
    );
  }

  const entries = activity.data ?? [];

  if (entries.length === 0) {
    return (
      <EmptyState
        title="Nothing has happened yet"
        description="Every change to this event shows up here — who did it and when."
      />
    );
  }

  const canLoadMore = entries.length >= limit && limit < MAX;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card">
        <ul className="divide-y">
          {entries.map((entry) => (
            <li key={entry.id} className="flex gap-3 px-4 py-3">
              <UserAvatar
                name={entry.actorName ?? "?"}
                className="mt-0.5 size-6 shrink-0 text-[10px]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug">
                  <span className="font-medium">{entry.actorName ?? "Someone"}</span>{" "}
                  <span className="text-foreground-soft">{entry.summary}</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatRelativeTime(entry.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {canLoadMore ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setLimit((current) => Math.min(current + PAGE_SIZE, MAX))}
            disabled={activity.isFetching}
          >
            {activity.isFetching ? (
              <>
                Loading <LoadingDots />
              </>
            ) : (
              "Show more"
            )}
          </Button>
        </div>
      ) : (
        <p className="text-center text-xs text-muted-foreground">
          {limit >= MAX
            ? "Showing the most recent 100 changes."
            : "That's everything."}
        </p>
      )}
    </div>
  );
}