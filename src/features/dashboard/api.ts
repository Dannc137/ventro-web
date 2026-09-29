import { api } from "@/lib/api-client"
import type { DashboardView } from "./types"

export async function getDashboard(eventId: string): Promise<DashboardView> {
  const response = await api.get(`/events/${eventId}/dashboard`)
  return response.data
}
