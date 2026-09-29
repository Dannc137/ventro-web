import type { EventRole } from "@/features/events/types";

export type MemberView = {
  memberId: string;
  userId: string;
  fullName: string;
  email: string;
  role: EventRole;
  joinedAt: string;
  isYou: boolean;
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