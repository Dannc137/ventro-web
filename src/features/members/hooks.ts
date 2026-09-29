import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { EventRole } from "@/features/events/types";
import {
  changeMemberRole,
  createInviteLink,
  fetchInvites,
  fetchMembers,
  inviteMember,
  removeMember,
  revokeInvite,
} from "./api";
import type { CreateInviteLinkRequest, InviteRequest } from "./types";

export function useMembers(eventId: string) {
  return useQuery({
    queryKey: queryKeys.members(eventId),
    queryFn: () => fetchMembers(eventId),
    enabled: Boolean(eventId),
  });
}

export function useInvites(eventId: string) {
  return useQuery({
    queryKey: queryKeys.invites(eventId),
    queryFn: () => fetchInvites(eventId),
    enabled: Boolean(eventId),
  });
}

function useMemberInvalidation(eventId: string) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.members(eventId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(eventId) });
  };
}

export function useInviteMember(eventId: string) {
  const invalidate = useMemberInvalidation(eventId);

  return useMutation({
    mutationFn: (body: InviteRequest) => inviteMember(eventId, body),
    onSuccess: invalidate,
  });
}

export function useChangeMemberRole(eventId: string) {
  const invalidate = useMemberInvalidation(eventId);

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: EventRole }) =>
      changeMemberRole(eventId, memberId, role),
    onSuccess: invalidate,
  });
}

export function useRemoveMember(eventId: string) {
  const invalidate = useMemberInvalidation(eventId);

  return useMutation({
    mutationFn: (memberId: string) => removeMember(eventId, memberId),
    onSuccess: invalidate,
  });
}

export function useCreateInviteLink(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateInviteLinkRequest) => createInviteLink(eventId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.invites(eventId) }),
  });
}

export function useRevokeInvite(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) => revokeInvite(eventId, inviteId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.invites(eventId) }),
  });
}