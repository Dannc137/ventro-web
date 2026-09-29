import { api } from "@/lib/api-client";
import type {
  ContributionView,
  CreateContributionRequest,
  FundingSummary,
  RecordPaymentRequest,
} from "./types";

export async function fetchMoney(eventId: string): Promise<FundingSummary> {
  const { data } = await api.get<FundingSummary>(`/events/${eventId}/money`);
  return data;
}

export async function createContribution(
  eventId: string,
  body: CreateContributionRequest,
): Promise<ContributionView> {
  const { data } = await api.post<ContributionView>(
    `/events/${eventId}/money/contributions`,
    body,
  );
  return data;
}

export async function recordPayment(
  eventId: string,
  contributionId: string,
  body: RecordPaymentRequest,
): Promise<ContributionView> {
  const { data } = await api.post<ContributionView>(
    `/events/${eventId}/money/contributions/${contributionId}/payments`,
    body,
  );
  return data;
}

export async function deleteContribution(
  eventId: string,
  contributionId: string,
): Promise<void> {
  await api.delete(`/events/${eventId}/money/contributions/${contributionId}`);
}

export async function setPaymentInstructions(
  eventId: string,
  instructions: string,
): Promise<void> {
  await api.put(`/events/${eventId}/money/payment-instructions`, { instructions });
}

export async function updateContribution(
  eventId: string,
  contributionId: string,
  body: { contributorName?: string; pledged?: number; note?: string },
): Promise<ContributionView> {
  const { data } = await api.patch<ContributionView>(
    `/events/${eventId}/money/contributions/${contributionId}`,
    body,
  );
  return data;
}