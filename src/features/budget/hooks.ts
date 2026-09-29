import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  createBudgetItem,
  deleteBudgetItem,
  fetchBudget,
  updateBudgetItem,
} from "./api";
import type { CreateBudgetItemRequest, UpdateBudgetItemRequest } from "./types";

export function useBudget(eventId: string) {
  return useQuery({
    queryKey: queryKeys.budget(eventId),
    queryFn: () => fetchBudget(eventId),
    enabled: Boolean(eventId),
  });
}

function useBudgetInvalidation(eventId: string) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.budget(eventId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(eventId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.money(eventId) });
  };
}

export function useCreateBudgetItem(eventId: string) {
  const invalidate = useBudgetInvalidation(eventId);

  return useMutation({
    mutationFn: (body: CreateBudgetItemRequest) => createBudgetItem(eventId, body),
    onSuccess: invalidate,
  });
}

export function useUpdateBudgetItem(eventId: string) {
  const invalidate = useBudgetInvalidation(eventId);

  return useMutation({
    mutationFn: ({ itemId, body }: { itemId: string; body: UpdateBudgetItemRequest }) =>
      updateBudgetItem(eventId, itemId, body),
    onSuccess: invalidate,
  });
}

export function useDeleteBudgetItem(eventId: string) {
  const invalidate = useBudgetInvalidation(eventId);

  return useMutation({
    mutationFn: (itemId: string) => deleteBudgetItem(eventId, itemId),
    onSuccess: invalidate,
  });
}