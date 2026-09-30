import { api } from "@/lib/api-client";
import type { CreateEventRequest, EventCard, EventDetail, UpdateEventRequest } from "./types";

export async function fetchEvents(): Promise<EventCard[]> {
  const { data } = await api.get<EventCard[]>("/events");
  return data;
}

export async function fetchEvent(eventId: string): Promise<EventDetail> {
  const { data } = await api.get<EventDetail>(`/events/${eventId}`);
  return data;
}

export async function createEvent(body: CreateEventRequest): Promise<EventDetail> {
  const { data } = await api.post<EventDetail>("/events", body);
  return data;
}

export async function updateEvent(
  eventId: string,
  body: UpdateEventRequest,
): Promise<EventDetail> {
  const { data } = await api.patch<EventDetail>(`/events/${eventId}`, body);
  return data;
}

export async function changeEventDate(
  eventId: string,
  eventDate: string,
): Promise<EventDetail> {
  const { data } = await api.patch<EventDetail>(`/events/${eventId}/date`, { eventDate });
  return data;
}

export async function setEventArchived(
  eventId: string,
  archived: boolean,
): Promise<EventDetail> {
  const { data } = await api.patch<EventDetail>(`/events/${eventId}/archive`, {
    archived,
  });
  return data;
}

export async function deleteEvent(eventId: string): Promise<void> {
  await api.delete(`/events/${eventId}`);
}

export async function enableSharing(eventId: string): Promise<{ token: string }> {
  const { data } = await api.post<{ token: string }>(`/events/${eventId}/share`);
  return data;
}

export async function disableSharing(eventId: string): Promise<void> {
  await api.delete(`/events/${eventId}/share`);
}

export async function cancelEvent(
  eventId: string,
  reason: string | null,
): Promise<EventDetail> {
  const { data } = await api.post<EventDetail>(`/events/${eventId}/cancel`, {
    reason,
  });
  return data;
}

export async function uncancelEvent(eventId: string): Promise<EventDetail> {
  const { data } = await api.post<EventDetail>(`/events/${eventId}/uncancel`);
  return data;
}