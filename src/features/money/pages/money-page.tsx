import { useState } from "react";
import { useOutletContext, useParams } from "react-router";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { MoneyText } from "@/components/shared/money-text";
import { ProgressBar } from "@/components/shared/progress-bar";
import { UserAvatar } from "@/components/shared/user-avatar";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate, formatMoney } from "@/lib/format";
import { can } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { EventDetail } from "@/features/events/types";
import { AddContributorDialog } from "../components/add-contributor-dialog";
import { CorrectPaymentDialog } from "../components/correct-payment-dialog";
import { EditContributorDialog } from "../components/edit-contributor-dialog";
import { PaymentInstructionsCard } from "../components/payment-instructions-card";
import { RecordPaymentDialog } from "../components/record-payment-dialog";
import { useDeleteContribution, useMoney } from "../hooks";
import {
    PAYMENT_METHOD_LABELS,
    type ContributionView,
    type PaymentView,
} from "../types";

export function MoneyPage() {
    const { eventId = "" } = useParams();
    const event = useOutletContext<EventDetail | undefined>();

    const money = useMoney(eventId);
    const deleteContribution = useDeleteContribution(eventId);

    const [addOpen, setAddOpen] = useState(false);
    const [payingFor, setPayingFor] = useState<ContributionView | null>(null);
    const [editing, setEditing] = useState<ContributionView | null>(null);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [correcting, setCorrecting] = useState<{
        contribution: ContributionView;
        payment: PaymentView;
    } | null>(null);

    const canEdit = can(event?.permissions, "EDIT_MONEY");

    function handleDelete(contribution: ContributionView) {
        deleteContribution.mutate(contribution.id, {
            onSuccess: () => toast.success("Contributor removed"),
            onError: (error) => toast.error(getErrorMessage(error)),
        });
    }

    if (money.isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-24 rounded-lg" />
                <Skeleton className="h-28 rounded-lg" />
                <Skeleton className="h-64 rounded-lg" />
            </div>
        );
    }

    if (money.isError) {
        return (
            <div className="rounded-lg border bg-destructive-tint px-4 py-3 text-sm text-destructive-strong">
                {getErrorMessage(money.error)}
            </div>
        );
    }

    const data = money.data;
    if (!data) return null;

    const percentReceived =
        data.totalPledged > 0 ? (data.totalReceived / data.totalPledged) * 100 : 0;

    const hasExtra = data.gap < 0;

    return (
        <div className="space-y-6">
            <PaymentInstructionsCard
                eventId={eventId}
                instructions={data.paymentInstructions}
                canEdit={canEdit}
            />

            <div className="rounded-lg border bg-card p-5">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <div>
                        <p className="text-xs text-muted-foreground">Promised</p>
                        <p className="mt-1 text-xl leading-tight font-semibold tabular-nums">
                            {formatMoney(data.totalPledged)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Received</p>
                        <p className="mt-1 text-xl leading-tight font-semibold text-success-strong tabular-nums">
                            {formatMoney(data.totalReceived)}
                        </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <p className="text-xs text-muted-foreground">
                            {hasExtra ? "Extra received" : "Not yet sent"}
                        </p>
                        <p
                            className={cn(
                                "mt-1 text-xl leading-tight font-semibold tabular-nums",
                                hasExtra && "text-success-strong",
                                data.gap > 0 && "text-warning-strong",
                            )}
                        >
                            {formatMoney(Math.abs(data.gap))}
                        </p>
                    </div>
                </div>
                <ProgressBar percent={percentReceived} tone="success" className="mt-4" />
            </div>

            {canEdit && (
                <div className="flex justify-end">
                    <Button onClick={() => setAddOpen(true)}>Add contributor</Button>
                </div>
            )}

            {data.contributions.length === 0 ? (
                <EmptyState
                    title="No contributors yet"
                    description="Add everyone who's chipping in, then record their payments as the money arrives."
                    action={
                        canEdit ? (
                            <Button onClick={() => setAddOpen(true)}>Add contributor</Button>
                        ) : undefined
                    }
                />
            ) : (
                <div className="space-y-2">
                    {data.contributions.map((contribution) => {
                        const isOpen = expanded === contribution.id;
                        const extra = contribution.received - contribution.pledged;

                        const StatusBadge = () =>
                            extra > 0 ? (
                                <span className="shrink-0 rounded-full bg-success-tint px-2 py-0.5 text-xs font-medium text-success-strong tabular-nums">
                                    Paid {formatMoney(extra)} extra
                                </span>
                            ) : contribution.settled ? (
                                <span className="shrink-0 rounded-full bg-success-tint px-2 py-0.5 text-xs font-medium text-success-strong">
                                    Fully paid
                                </span>
                            ) : (
                                <span className="shrink-0 rounded-full bg-warning-tint px-2 py-0.5 text-xs font-medium text-warning-strong tabular-nums">
                                    {formatMoney(contribution.outstanding)} left
                                </span>
                            );

                        const ContributionMenu = () => (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        aria-label={`Actions for ${contribution.contributorName}`}
                                        className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
                                    >
                                        <MoreHorizontal className="size-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setPayingFor(contribution)}>
                                        Record payment
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setEditing(contribution)}>
                                        Edit details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        disabled={contribution.payments.length > 0}
                                        onClick={() => handleDelete(contribution)}
                                        className="text-destructive-strong"
                                    >
                                        Remove
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        );

                        return (
                            <div key={contribution.id} className="rounded-lg border bg-card">
                                <div className="p-4">
                                    {/* Desktop */}
                                    <div className="hidden items-center gap-3 md:flex">
                                        <UserAvatar
                                            name={contribution.contributorName}
                                            className="size-8 shrink-0"
                                        />

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {contribution.contributorName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {contribution.onApp ? "On Ventro" : "Not on app"}
                                            </p>
                                        </div>

                                        <div className="w-32 text-right">
                                            <p className="text-xs text-muted-foreground">Promised</p>
                                            <MoneyText amount={contribution.pledged} className="text-sm" />
                                        </div>

                                        <div className="w-32 text-right">
                                            <p className="text-xs text-muted-foreground">Received</p>
                                            <MoneyText
                                                amount={contribution.received}
                                                className="text-sm font-medium text-success-strong"
                                            />
                                        </div>

                                        <div className="flex w-40 justify-end">
                                            <StatusBadge />
                                        </div>

                                        {canEdit && <ContributionMenu />}
                                    </div>

                                    {/* Mobile */}
                                    <div className="md:hidden">
                                        <div className="flex items-start gap-3">
                                            <UserAvatar
                                                name={contribution.contributorName}
                                                className="size-8 shrink-0"
                                            />

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {contribution.contributorName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {contribution.onApp ? "On Ventro" : "Not on app"}
                                                </p>
                                            </div>

                                            <StatusBadge />

                                            {canEdit && <ContributionMenu />}
                                        </div>

                                        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <dt className="text-muted-foreground">Promised</dt>
                                                <dd className="mt-0.5 font-medium tabular-nums">
                                                    {formatMoney(contribution.pledged)}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-muted-foreground">Received</dt>
                                                <dd className="mt-0.5 font-medium text-success-strong tabular-nums">
                                                    {formatMoney(contribution.received)}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setExpanded(isOpen ? null : contribution.id)}
                                        aria-expanded={isOpen}
                                        className="mt-3 flex items-center gap-1 rounded-md text-xs text-muted-foreground hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
                                    >
                                        <ChevronDown
                                            className={cn(
                                                "size-3.5 transition-transform",
                                                isOpen && "rotate-180",
                                            )}
                                        />
                                        {contribution.payments.length === 0
                                            ? "No payments yet"
                                            : `${contribution.payments.length} payment${contribution.payments.length === 1 ? "" : "s"
                                            }`}
                                    </button>
                                </div>

                                {isOpen && (
                                    <div className="border-t px-4 py-3">
                                        {contribution.payments.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">
                                                Nothing received yet.
                                            </p>
                                        ) : (
                                            <ul className="space-y-3">
                                                {contribution.payments.map((payment) => (
                                                    <li key={payment.id} className="text-sm">
                                                        <div className="flex items-baseline justify-between gap-3">
                                                            <MoneyText
                                                                amount={payment.amount}
                                                                className={cn(
                                                                    "font-medium",
                                                                    payment.amount < 0 && "text-destructive-strong",
                                                                )}
                                                            />
                                                            <div className="flex items-baseline gap-3">
                                                                <span className="text-xs text-muted-foreground">
                                                                    {formatDate(payment.paidOn)} ·{" "}
                                                                    {PAYMENT_METHOD_LABELS[payment.method]}
                                                                </span>
                                                                {canEdit && payment.amount > 0 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setCorrecting({ contribution, payment })
                                                                        }
                                                                        className="rounded-md text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
                                                                    >
                                                                        Fix
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {payment.note && (
                                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                                {payment.note}
                                                            </p>
                                                        )}
                                                        {payment.recordedByName && (
                                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                                Recorded by {payment.recordedByName}
                                                            </p>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <AddContributorDialog eventId={eventId} open={addOpen} onOpenChange={setAddOpen} />

            <RecordPaymentDialog
                eventId={eventId}
                contribution={payingFor}
                onOpenChange={(open) => !open && setPayingFor(null)}
            />

            <EditContributorDialog
                eventId={eventId}
                contribution={editing}
                onOpenChange={(open) => !open && setEditing(null)}
            />

            <CorrectPaymentDialog
                eventId={eventId}
                contribution={correcting?.contribution ?? null}
                payment={correcting?.payment ?? null}
                onOpenChange={(open) => !open && setCorrecting(null)}
            />
        </div>
    );
}