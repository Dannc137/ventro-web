import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { subscribe, type RealtimeMessage } from "@/lib/realtime";

/** Keeps every query for one event fresh while you're looking at it. */
export function useEventRealtime(eventId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
  if (!eventId) return;

  return subscribe(`/topic/events/${eventId}`, (message: RealtimeMessage) => {
      const invalidate = (key: readonly unknown[]) =>
        queryClient.invalidateQueries({ queryKey: key });

      switch (message.area) {
        case "tasks":
          invalidate(queryKeys.tasks(eventId));
          invalidate(queryKeys.dashboard(eventId));
          invalidate(["activity", eventId]);
          break;
        case "budget":
          invalidate(queryKeys.budget(eventId));
          invalidate(queryKeys.dashboard(eventId));
          invalidate(["activity", eventId]);
          break;
        case "money":
          invalidate(queryKeys.money(eventId));
          invalidate(queryKeys.dashboard(eventId));
          invalidate(["activity", eventId]);
          break;
        case "comments":
          invalidate(["comments"]);
          break;
        case "event":
          invalidate(queryKeys.events.detail(eventId));
          invalidate(queryKeys.events.all);
          invalidate(queryKeys.dashboard(eventId));
          invalidate(["activity", eventId]);
          break;
        case "members":
          invalidate(queryKeys.members(eventId));
          invalidate(queryKeys.invites(eventId));
          break;
      }
    });
  }, [eventId, queryClient]);
}