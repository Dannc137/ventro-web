import { api } from "@/lib/api-client";
import type {
  BudgetItemView,
  BudgetSummary,
  CreateBudgetItemRequest,
  UpdateBudgetItemRequest,
} from "./types";

export async function fetchBudget(eventId: string): Promise<BudgetSummary> {
  const { data } = await api.get<BudgetSummary>(`/events/${eventId}/budget`);
  return data;
}

export async function createBudgetItem(
  eventId: string,
  body: CreateBudgetItemRequest,
): Promise<BudgetItemView> {
  const { data } = await api.post<BudgetItemView>(`/events/${eventId}/budget`, body);
  return data;
}

export async function updateBudgetItem(
  eventId: string,
  itemId: string,
  body: UpdateBudgetItemRequest,
): Promise<BudgetItemView> {
  const { data } = await api.patch<BudgetItemView>(
    `/events/${eventId}/budget/${itemId}`,
    body,
  );
  return data;
}

export async function deleteBudgetItem(eventId: string, itemId: string): Promise<void> {
  await api.delete(`/events/${eventId}/budget/${itemId}`);
}