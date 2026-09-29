import { cn } from "@/lib/utils";
import { budgetStatus, type BudgetItemView } from "../types";
import { formatMoney } from "@/lib/format";

const STYLES = {
  PLANNED: { label: "Not booked", tone: "bg-muted text-muted-foreground" },
  COMMITTED: { label: "Unpaid", tone: "bg-warning-tint text-warning-strong" },
  PART_PAID: { label: "Part paid", tone: "bg-warning-tint text-warning-strong" },
  PAID: { label: "Paid", tone: "bg-success-tint text-success-strong" },
} as const;

export function BudgetStatusBadge({ item }: { item: BudgetItemView }) {
  const status = budgetStatus(item);
  const { label, tone } = STYLES[status];
  const outstanding = item.committed - item.paid;

  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      <span
        className={cn(
          "inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
          tone,
        )}
      >
        {label}
      </span>
      {status === "PART_PAID" && (
        <span className="text-xs text-warning-strong tabular-nums">
          {formatMoney(outstanding)} left
        </span>
      )}
    </span>
  );
}