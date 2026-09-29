export type PayerSummary = {
  id: string;
  fullName: string;
};

export type BudgetItemView = {
  id: string;
  label: string;
  category: string;
  vendorName: string | null;
  planned: number;
  committed: number;
  paid: number;
  outstanding: number;
  variance: number;
  overBudget: boolean;
  paidBy: PayerSummary | null;
  dueDate: string | null;
  note: string | null;
};

export type CategoryGroup = {
  category: string;
  planned: number;
  committed: number;
  paid: number;
  items: BudgetItemView[];
};

export type BudgetSummary = {
  totalPlanned: number;
  totalCommitted: number;
  totalPaid: number;
  totalOutstanding: number;
  remaining: number;
  overBudget: boolean;
  categories: CategoryGroup[];
};

export type CreateBudgetItemRequest = {
  label: string;
  category?: string;
  vendorName?: string;
  planned?: number;
  committed?: number;
  paid?: number;
  paidById?: string;
  dueDate?: string;
  note?: string;
};

export type UpdateBudgetItemRequest = Partial<CreateBudgetItemRequest>;

/** Derived in the frontend — the backend doesn't send a status field. */
export type BudgetStatus = "PLANNED" | "COMMITTED" | "PART_PAID" | "PAID";

export function budgetStatus(item: BudgetItemView): BudgetStatus {
  if (item.committed <= 0) return "PLANNED";
  if (item.paid >= item.committed) return "PAID";
  if (item.paid > 0) return "PART_PAID";
  return "COMMITTED";
}