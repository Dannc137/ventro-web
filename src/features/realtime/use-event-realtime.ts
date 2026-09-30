import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth";
import type { CommentBroadcast, CommentView } from "@/features/comments/types";
import type { EventDetail } from "@/features/events/types";
import { can } from "@/lib/permissions";
import { queryKeys } from "@/lib/query-keys";
import { subscribe, type RealtimeMessage } from "@/lib/realtime";

/** Keeps every query for one event fresh while you're looking at it. */
export function useEventRealtime(eventId: string | undefined) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!eventId) return;

    return subscribe(`/topic/events/${eventId}`, (message: RealtimeMessage) => {
      const invalidate = (key: readonly unknown[]) =>
        queryClient.invalidateQueries({ queryKey: key });

      switch (message.area) {
        case "comment-added": {
            console.log("[rt] comment pushed", message.comment);
          const c = message.comment as CommentBroadcast | undefined;
          if (!c) break;

          const event = queryClient.getQueryData<EventDetail>(
            queryKeys.events.detail(eventId),
          );

          // Clients can't see internal comments.
          if (c.internal && !can(event?.permissions, "VIEW_INTERNAL")) break;

          queryClient.setQueryData<CommentView[]>(
            queryKeys.comments(c.entityType, c.entityId),
            (old = []) => {
              if (old.some((existing) => existing.id === c.id)) return old;

              return [
                ...old,
                {
                  id: c.id,
                  body: c.body,
                  internal: c.internal,
                  authorId: c.authorId,
                  authorName: c.authorName,
                  createdAt: c.createdAt,
                  updatedAt: c.updatedAt,
                  edited: false,
                  mine: c.authorId === user?.id,
                },
              ];
            },
          );
          break;
        }

        case "comments":
          invalidate(["comments"]);
          break;

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
  }, [eventId, queryClient, user]);
}