import { api } from "@/lib/api-client";
import type { JoinResult, PendingInvite } from "./types";

export async function fetchMyInvites(): Promise<PendingInvite[]> {
  const { data } = await api.get<PendingInvite[]>("/users/me/invites");
  return data;
}

export async function acceptInvite(inviteId: string): Promise<JoinResult> {
  const { data } = await api.post<JoinResult>(`/users/me/invites/${inviteId}/accept`);
  return data;
}

export async function declineInvite(inviteId: string): Promise<void> {
  await api.post(`/users/me/invites/${inviteId}/decline`);
}
