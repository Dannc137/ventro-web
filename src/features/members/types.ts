import type { EventRole } from "@/features/events/types";

export type MemberView = {
  memberId: string | null;
  userId: string;
  fullName: string;
  email: string;
  role: EventRole;
  joinedAt: string | null;
  isYou: boolean;
  pending: boolean;
  inviteId: string | null;
};

export type InviteView = {
  id: string;
  token: string;
  role: EventRole;
  maxUses: number | null;
  uses: number;
  expiresAt: string | null;
  revoked: boolean;
  usable: boolean;
};

export type InviteRequest = {
  email: string;
  role: EventRole;
};

export type CreateInviteLinkRequest = {
  role?: EventRole;
  maxUses?: number;
  expiresInDays?: number;
};