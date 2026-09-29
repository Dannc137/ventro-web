export type EventRole = "OWNER" | "PLANNER" | "CONTRIBUTOR" | "CLIENT"

import type { Permission } from "@/lib/permissions"

export type EventDetail = {
  id: string
  name: string
  eventDate: string
  venue: string | null
  timezone: string
  status: EventStatus
  myRole: EventRole
  permissions: Permission[]
  daysUntil: number
}

export type CreateEventRequest = {
  name: string
  eventDate: string
  venue?: string
}

export type EventStatus = "ACTIVE" | "ARCHIVED"

export type EventCard = {
  id: string
  name: string
  eventDate: string
  venue: string | null
  myRole: EventRole
  daysUntil: number
  status: EventStatus
}

export type UpdateEventRequest = {
  name?: string
  venue?: string
}
