import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth";
import { queryKeys } from "@/lib/query-keys";
import { subscribe } from "@/lib/realtime";

export function useNotificationRealtime() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    return subscribe(`/topic/users/${user.id}`, () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      // An EVENT_INVITE notification is one of the things that lands here —
      // refresh the pending-invite banner too so it shows up without a reload.
      queryClient.invalidateQueries({ queryKey: queryKeys.myInvites });
    });
  }, [user, queryClient]);
}