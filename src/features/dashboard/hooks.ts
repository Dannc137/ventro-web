import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getDashboard } from "./api";

export function useDashboard(eventId: string) {
  return useQuery({
    queryKey: queryKeys.dashboard(eventId),
    queryFn: () => getDashboard(eventId),
    enabled: Boolean(eventId),
  });
}