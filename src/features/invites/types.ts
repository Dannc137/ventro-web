import type { EventRole } from "@/features/events/types";

export type PendingInvite = {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  venue: string | null;
  invitedByName: string;
  role: EventRole;
  createdAt: string;
};

export type JoinResult = {
  eventId: string;
  eventName: string;
  role: EventRole;
  alreadyMember: boolean;
};
