import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchActivity } from "./api";

export function useActivity(eventId: string, limit: number) {
  return useQuery({
    queryKey: queryKeys.activity(eventId, limit),
    queryFn: () => fetchActivity(eventId, limit),
    enabled: Boolean(eventId),
  });
}