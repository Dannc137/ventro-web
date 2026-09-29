import { api } from "@/lib/api-client";
import type { ActivityView } from "./types";

export async function fetchActivity(
  eventId: string,
  limit: number,
): Promise<ActivityView[]> {
  const { data } = await api.get<ActivityView[]>(`/events/${eventId}/activity`, {
    params: { limit },
  });
  return data;
}