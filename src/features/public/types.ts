import type { EventRole } from "@/features/events/types"

export type InvitePreview = {
  eventName: string
  eventDate: string
  venue: string | null
  role: EventRole
  invitedByName: string | null
  valid: boolean
  reason: string | null
}

export type JoinResult = {
  eventId: string
  eventName: string
  role: EventRole
  alreadyMember: boolean
}

export type ProgressBand = {
  label: string
  percent: number
}

export type Milestone = {
  title: string
  dueDate: string
  done: boolean
}

export type ClientView = {
  eventName: string
  eventDate: string
  venue: string | null
  daysUntilEvent: number
  sharedByName: string | null
  progress: ProgressBand[]
  milestones: Milestone[]
  budgetApproved: number
  budgetCommitted: number
  budgetRemaining: number
  upNext: Milestone[]
}
