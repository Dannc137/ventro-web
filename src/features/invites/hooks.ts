import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { acceptInvite, declineInvite, fetchMyInvites } from "./api";

export function useMyInvites() {
  return useQuery({
    queryKey: queryKeys.myInvites,
    queryFn: fetchMyInvites,
  });
}

function useMyInvitesInvalidation() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.myInvites });
    queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
  };
}

export function useAcceptInvite() {
  const invalidate = useMyInvitesInvalidation();

  return useMutation({
    mutationFn: acceptInvite,
    onSuccess: invalidate,
  });
}

export function useDeclineInvite() {
  const invalidate = useMyInvitesInvalidation();

  return useMutation({
    mutationFn: declineInvite,
    onSuccess: invalidate,
  });
}
