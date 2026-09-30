import { api } from "@/lib/api-client";
import type { NotificationFeed } from "./types";

export async function fetchNotifications(limit = 20): Promise<NotificationFeed> {
  const { data } = await api.get<NotificationFeed>("/notifications", {
    params: { limit },
  });
  return data;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.post(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post("/notifications/read-all");
}