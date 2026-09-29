import { useState } from "react";
import { useOutletContext, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { MoneyText } from "@/components/shared/money-text";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ProgressBar } from "@/components/shared/progress-bar";
import { getErrorMessage } from "@/lib/api-client";
import { formatMoney } from "@/lib/format";
import { can } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { EventDetail } from "@/features/events/types";
import { BudgetItemDialog } from "../components/budget-item-dialog.tsx";
import { BudgetStatusBadge } from "../components/budget-status-badge";
import { useBudget } from "../hooks";
import type { BudgetItemView } from "../types";

export function BudgetPage() {
    const { eventId = "" } = useParams();
    const event = useOutletContext<EventDetail | undefined>();
    const budget = useBudget(eventId);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<BudgetItemView | null>(null);

    const canEdit = can(event?.permissions, "EDIT_BUDGET");

    function openCreate() {
        setEditing(null);
        setDialogOpen(true);
    }

    function openEdit(item: BudgetItemView) {
        setEditing(item);
        setDialogOpen(true);
    }

    if (budget.isLoading) {
        return (
            <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-lg" />
                    ))}
                </div>
                <Skeleton className="h-80 rounded-lg" />
            </div>
        );
    }

    if (budget.isError) {
        return (
            <div className="rounded-lg border bg-destructive-tint px-4 py-3 text-sm text-destructive-strong">
                {getErrorMessage(budget.error)}
            </div>
        );
    }

    const data = budget.data;
    if (!data) return null;

    const hasItems = data.categories.length > 0;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryTile label="Budget" amount={data.totalPlanned} />
                <SummaryTile label="Agreed with vendors" amount={data.totalCommitted} />
                <SummaryTile label="Paid so far" amount={data.totalPaid} />
                <SummaryTile
                    label="Still owed"
                    amount={data.totalOutstanding}
                    tone={data.totalOutstanding > 0 ? "warning" : undefined}
                />
            </div>

            {canEdit && (
                <div className="flex justify-end">
                    <Button onClick={openCreate}>Add item</Button>
                </div>
            )}

            {!hasItems ? (
                <EmptyState
                    title="No budget items yet"
                    description="Add what you plan to spend, then record what you've committed and paid."
                    action={canEdit ? <Button onClick={openCreate}>Add item</Button> : undefined}
                />
            ) : (
                <>
                    {/* Desktop table */}
                    <div className="hidden rounded-lg border bg-card md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead className="text-right">Planned</TableHead>
                                    <TableHead className="text-right">Committed</TableHead>
                                    <TableHead className="text-right">Paid</TableHead>
                                    <TableHead>Paid by</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.categories.map((group) => (
                                    <>
                                        <TableRow key={group.category} className="bg-muted/80 hover:bg-muted/80">
                                            <TableCell colSpan={2} className="text-[13px] font-semibold text-foreground">
                                                {group.category}
                                            </TableCell>
                                            <TableCell className="text-right text-[13px] font-semibold">
                                                <MoneyText amount={group.planned} />
                                            </TableCell>
                                            <TableCell className="text-right text-[13px] font-semibold">
                                                <MoneyText amount={group.committed} />
                                            </TableCell>
                                            <TableCell className="text-right text-[13px] font-semibold">
                                                <MoneyText amount={group.paid} />
                                            </TableCell>
                                            <TableCell colSpan={2} />
                                        </TableRow>

                                        {group.items.map((item) => (
                                            <TableRow
                                                key={item.id}
                                                onClick={canEdit ? () => openEdit(item) : undefined}
                                                className={cn(canEdit && "cursor-pointer")}
                                            >
                                                <TableCell className="font-medium">{item.label}</TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {item.vendorName ?? "—"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <MoneyText amount={item.planned} muted />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <MoneyText
                                                        amount={item.committed}
                                                        muted
                                                        className={item.overBudget ? "text-destructive-strong" : ""}
                                                    />
                                                    {item.overBudget && (
                                                        <span className="block text-xs text-destructive-strong tabular-nums">
                                                            +{formatMoney(item.variance)} over
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <MoneyText amount={item.paid} muted />
                                                </TableCell>
                                                <TableCell>
                                                    {item.paidBy ? (
                                                        <span className="flex items-center gap-2">
                                                            <UserAvatar
                                                                name={item.paidBy.fullName}
                                                                className="size-6 text-[10px]"
                                                            />
                                                            <span className="text-muted-foreground">
                                                                {item.paidBy.fullName.split(" ")[0]}
                                                            </span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <BudgetStatusBadge item={item} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </>
                                ))}

                                <TableRow className="border-t-2 hover:bg-transparent">
                                    <TableCell colSpan={2} className="font-semibold">
                                        Total
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                        <MoneyText amount={data.totalPlanned} />
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                        <MoneyText amount={data.totalCommitted} />
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                        <MoneyText amount={data.totalPaid} />
                                    </TableCell>
                                    <TableCell colSpan={2} />
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile cards */}
<div className="space-y-6 md:hidden">
  {data.categories.map((group) => (
    <section key={group.category}>
      <div className="flex items-baseline justify-between pb-2">
        <h2 className="text-[13px] font-semibold">{group.category}</h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatMoney(group.paid)} of {formatMoney(group.committed)}
        </span>
      </div>

      <div className="space-y-2">
        {group.items.map((item) => {
          const outstanding = item.committed - item.paid;
          const percent =
            item.committed > 0 ? (item.paid / item.committed) * 100 : 0;

          return (
            <button
              key={item.id}
              type="button"
              disabled={!canEdit}
              onClick={() => openEdit(item)}
              className="w-full rounded-lg border bg-card p-4 text-left focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[15px] leading-tight font-semibold">
                    {item.label}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {item.vendorName ?? "No vendor"}
                  </p>
                </div>
                <BudgetStatusBadge item={item} />
              </div>

              {item.committed > 0 && (
                <ProgressBar
                  percent={percent}
                  tone={outstanding > 0 ? "warning" : "success"}
                  className="mt-3"
                />
              )}

              <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <dt className="text-muted-foreground">Agreed</dt>
                  <dd className="mt-0.5 font-medium tabular-nums">
                    {formatMoney(item.committed)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Paid</dt>
                  <dd className="mt-0.5 font-medium tabular-nums">
                    {formatMoney(item.paid)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Owed</dt>
                  <dd
                    className={cn(
                      "mt-0.5 font-medium tabular-nums",
                      outstanding > 0 && "text-warning-strong",
                    )}
                  >
                    {formatMoney(outstanding)}
                  </dd>
                </div>
              </dl>

              {item.overBudget && (
                <p className="mt-2 text-xs text-destructive-strong tabular-nums">
                  {formatMoney(item.variance)} over the {formatMoney(item.planned)} budget
                </p>
              )}

              {item.paidBy && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <UserAvatar name={item.paidBy.fullName} className="size-5 text-[9px]" />
                  Paid by {item.paidBy.fullName}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  ))}
</div>
                </>
            )}

            <BudgetItemDialog
                eventId={eventId}
                item={editing}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </div>
    );
}

function SummaryTile({
    label,
    amount,
    tone,
}: {
    label: string;
    amount: number;
    tone?: "warning" | "destructive";
}) {
    return (
        <div className="rounded-lg border bg-card p-5">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p
                className={cn(
                    "mt-1 text-xl leading-tight font-semibold tabular-nums",
                    tone === "destructive" && "text-destructive-strong",
                    tone === "warning" && "text-warning-strong",
                )}
            >
                {formatMoney(amount)}
            </p>
        </div>
    );
}