import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchClientView, fetchInvitePreview, joinWithInvite } from "./api";

export function useInvitePreview(token: string) {
  return useQuery({
    queryKey: ["invite-preview", token],
    queryFn: () => fetchInvitePreview(token),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useJoinWithInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinWithInvite,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all }),
  });
}

export function useClientView(token: string) {
  return useQuery({
    queryKey: ["client-view", token],
    queryFn: () => fetchClientView(token),
    enabled: Boolean(token),
    retry: false,
  });
}