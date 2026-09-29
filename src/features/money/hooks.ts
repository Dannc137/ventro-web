import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  createContribution,
  deleteContribution,
  fetchMoney,
  recordPayment,
  setPaymentInstructions,
  updateContribution,
} from "./api";
import type { CreateContributionRequest, RecordPaymentRequest } from "./types";

export function useMoney(eventId: string) {
  return useQuery({
    queryKey: queryKeys.money(eventId),
    queryFn: () => fetchMoney(eventId),
    enabled: Boolean(eventId),
  });
}

function useMoneyInvalidation(eventId: string) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.money(eventId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(eventId) });
  };
}

export function useCreateContribution(eventId: string) {
  const invalidate = useMoneyInvalidation(eventId);

  return useMutation({
    mutationFn: (body: CreateContributionRequest) => createContribution(eventId, body),
    onSuccess: invalidate,
  });
}

export function useRecordPayment(eventId: string) {
  const invalidate = useMoneyInvalidation(eventId);

  return useMutation({
    mutationFn: ({
      contributionId,
      body,
    }: {
      contributionId: string;
      body: RecordPaymentRequest;
    }) => recordPayment(eventId, contributionId, body),
    onSuccess: invalidate,
  });
}

export function useDeleteContribution(eventId: string) {
  const invalidate = useMoneyInvalidation(eventId);

  return useMutation({
    mutationFn: (contributionId: string) => deleteContribution(eventId, contributionId),
    onSuccess: invalidate,
  });
}

export function useSetPaymentInstructions(eventId: string) {
  const invalidate = useMoneyInvalidation(eventId);

  return useMutation({
    mutationFn: (instructions: string) => setPaymentInstructions(eventId, instructions),
    onSuccess: invalidate,
  });
}

export function useUpdateContribution(eventId: string) {
  const invalidate = useMoneyInvalidation(eventId);

  return useMutation({
    mutationFn: ({
      contributionId,
      body,
    }: {
      contributionId: string;
      body: { contributorName?: string; pledged?: number; note?: string };
    }) => updateContribution(eventId, contributionId, body),
    onSuccess: invalidate,
  });
}
