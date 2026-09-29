import type {
  CreateInviteLinkRequest,
  InviteRequest,
  InviteView,
  MemberView,
} from "./types"
import type { EventRole } from "@/features/events/types"
import { api } from "@/lib/api-client"

export async function fetchMembers(eventId: string): Promise<MemberView[]> {
  const { data } = await api.get<MemberView[]>(`/events/${eventId}/members`)
  return data
}

export async function inviteMember(
  eventId: string,
  body: InviteRequest
): Promise<MemberView> {
  const { data } = await api.post<MemberView>(
    `/events/${eventId}/members`,
    body
  )
  return data
}

export async function changeMemberRole(
  eventId: string,
  memberId: string,
  role: EventRole
): Promise<MemberView> {
  const { data } = await api.patch<MemberView>(
    `/events/${eventId}/members/${memberId}`,
    { role }
  )
  return data
}

export async function removeMember(
  eventId: string,
  memberId: string
): Promise<void> {
  await api.delete(`/events/${eventId}/members/${memberId}`)
}

export async function fetchInvites(eventId: string): Promise<InviteView[]> {
  const { data } = await api.get<InviteView[]>(`/events/${eventId}/invites`)
  return data
}

export async function createInviteLink(
  eventId: string,
  body: CreateInviteLinkRequest
): Promise<InviteView> {
  const { data } = await api.post<InviteView>(
    `/events/${eventId}/invites`,
    body
  )
  return data
}

export async function revokeInvite(
  eventId: string,
  inviteId: string
): Promise<void> {
  await api.delete(`/events/${eventId}/invites/${inviteId}`)
}
