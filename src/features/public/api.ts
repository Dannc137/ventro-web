import { api } from "@/lib/api-client";
import type { ClientView, InvitePreview, JoinResult } from "./types";

export async function fetchInvitePreview(token: string): Promise<InvitePreview> {
  const { data } = await api.get<InvitePreview>(`/public/invites/${token}`);
  return data;
}

export async function joinWithInvite(token: string): Promise<JoinResult> {
  const { data } = await api.post<JoinResult>(`/invites/${token}/join`);
  return data;
}

export async function fetchClientView(token: string): Promise<ClientView> {
  const { data } = await api.get<ClientView>(`/public/share/${token}`);
  return data;
}