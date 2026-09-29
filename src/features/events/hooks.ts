import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { changeEventDate, createEvent, deleteEvent, disableSharing, enableSharing, fetchEvent, fetchEvents, setEventArchived, updateEvent } from "./api";
import type { UpdateEventRequest } from "./types";

export function useEvents() {
  return useQuery({
    queryKey: queryKeys.events.all,
    queryFn: fetchEvents,
  });
}

export function useEvent(eventId: string) {
  return useQuery({
    queryKey: queryKeys.events.detail(eventId),
    queryFn: () => fetchEvent(eventId),
    enabled: Boolean(eventId),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

function useEventInvalidation(eventId: string) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(eventId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks(eventId) });
  };
}

export function useUpdateEvent(eventId: string) {
  const invalidate = useEventInvalidation(eventId);

  return useMutation({
    mutationFn: (body: UpdateEventRequest) => updateEvent(eventId, body),
    onSuccess: invalidate,
  });
}

export function useChangeEventDate(eventId: string) {
  const invalidate = useEventInvalidation(eventId);

  return useMutation({
    mutationFn: (eventDate: string) => changeEventDate(eventId, eventDate),
    onSuccess: invalidate,
  });
}

export function useSetEventArchived(eventId: string) {
  const invalidate = useEventInvalidation(eventId);

  return useMutation({
    mutationFn: (archived: boolean) => setEventArchived(eventId, archived),
    onSuccess: invalidate,
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all }),
  });
}

export function useEnableSharing(eventId: string) {
  return useMutation({
    mutationFn: () => enableSharing(eventId),
  });
}

export function useDisableSharing(eventId: string) {
  return useMutation({
    mutationFn: () => disableSharing(eventId),
  });
}

