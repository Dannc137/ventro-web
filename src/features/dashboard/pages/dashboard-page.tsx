import { Link, useOutletContext, useParams } from "react-router";
import { AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/shared/user-avatar";
import { getErrorMessage } from "@/lib/api-client";
import { formatCountdown, formatMoney, formatRelativeTime } from "@/lib/format";
import { can } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { EventDetail } from "@/features/events/types";
import { useTasks } from "@/features/tasks/hooks";
import { StatCard } from "../components/stat-card";
import { useDashboard } from "../hooks";
import { useAuth } from "@/features/auth";

const GRID_COLUMNS = ["", "md:grid-cols-1", "md:grid-cols-2", "md:grid-cols-3"];

export function DashboardPage() {
    const { eventId = "" } = useParams();
    const { user } = useAuth();

    const event = useOutletContext<EventDetail | undefined>();

    const dashboard = useDashboard(eventId);
    const canSeeTasks = can(event, "VIEW_TASKS");
    
    
    const tasks = useTasks(canSeeTasks ? eventId : "");

    if (dashboard.isLoading) {
        return (
            <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 rounded-lg" />
                    ))}
                </div>
                <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
                    <Skeleton className="h-80 rounded-lg" />
                    <Skeleton className="h-80 rounded-lg" />
                </div>
            </div>
        );
    }

    if (dashboard.isError) {
        return (
            <div className="rounded-lg border bg-destructive-tint px-4 py-3 text-sm text-destructive-strong">
                {getErrorMessage(dashboard.error)}
            </div>
        );
    }

    const data = dashboard.data;
    if (!data) return null;

    const { schedule, budget, funding } = data;

    const canManageMoney = event?.permissions.includes("EDIT_MONEY") ?? false;
    const showsFunding = Boolean(funding) && canManageMoney;
    const showsMine = !canManageMoney && Boolean(data.myContribution);

    const statCount = [canSeeTasks, Boolean(budget), showsFunding || showsMine].filter(
        Boolean,
    ).length;

    const openTasks = (tasks.data ?? [])
        .filter((bucket) => bucket.label !== "Done")
        .flatMap((bucket) => bucket.tasks);

    const mine = openTasks.filter((task) => task.assignee?.id === user?.id);
    const showingMine = mine.length > 0;

    const upcoming = (showingMine ? mine : openTasks).slice(0, 5);

    

    return (
        <div className="space-y-4">
            <div className={cn("grid gap-4", GRID_COLUMNS[statCount])}>
                {canSeeTasks && (
                    <StatCard
                        label="Schedule"
                        value={`${schedule.percentComplete}%`}
                        caption={`${schedule.doneTasks} of ${schedule.totalTasks} tasks done`}
                        percent={schedule.percentComplete}
                        tone="success"
                        footnote={
                            schedule.daysBehind > 0
                                ? `${schedule.daysBehind} days behind pace`
                                : schedule.overdueTasks > 0
                                    ? `${schedule.overdueTasks} overdue`
                                    : undefined
                        }
                        footnoteTone="warning"
                    />
                )}

                {budget && (
                    <StatCard
                        label="Budget"
                        value={formatMoney(budget.paid)}
                        caption={`of ${formatMoney(budget.planned)} planned`}
                        percent={budget.percentCommitted}
                        tone={budget.overBudget ? "destructive" : "primary"}
                        footnote={
                            budget.outstanding > 0
                                ? `${formatMoney(budget.outstanding)} still owed`
                                : undefined
                        }
                        footnoteTone="warning"
                    />
                )}

                {showsFunding && funding && (
                    <StatCard
                        label="Money in"
                        value={formatMoney(funding.received)}
                        caption={`of ${formatMoney(funding.needed)} needed for this event`}
                        percent={funding.percentFunded}
                        tone={funding.gap > 0 ? "destructive" : "success"}
                        footnote={
                            funding.gap > 0
                                ? `${formatMoney(funding.gap)} still to come in`
                                : "Fully covered"
                        }
                        footnoteTone={funding.gap > 0 ? "warning" : "success"}
                    />
                )}

                {showsMine && data.myContribution && (
                    <StatCard
                        label="Your contribution"
                        value={formatMoney(data.myContribution.received)}
                        caption={`of ${formatMoney(data.myContribution.pledged)} you promised`}
                        percent={
                            data.myContribution.pledged > 0
                                ? (data.myContribution.received / data.myContribution.pledged) * 100
                                : 0
                        }
                        tone="success"
                        footnote={
                            data.myContribution.settled
                                ? "All sent — thank you"
                                : `${formatMoney(data.myContribution.outstanding)} left to send`
                        }
                        footnoteTone={data.myContribution.settled ? "success" : "warning"}
                    />
                )}
            </div>

            <div className="grid items-start gap-4 lg:grid-cols-[3fr_2fr]">
                {canSeeTasks && (
                    <section className="rounded-lg border bg-card p-5">
                        <div className="flex items-baseline justify-between gap-3">
                            <h2 className="text-[15px] font-semibold">
                                {showingMine ? "Your tasks" : "Needs attention"}
                            </h2>
                            <Link
                                to={showingMine ? "tasks?assignee=me" : "tasks?assignee=all"}
                                className="rounded-md text-xs font-medium text-primary hover:text-primary-hover focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
                            >
                                View all
                            </Link>
                        </div>

                        {tasks.isLoading ? (
                            <div className="mt-4 space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-10 w-full" />
                                ))}
                            </div>
                        ) : tasks.isError ? (
                            <div className="mt-4 rounded-lg border bg-destructive-tint px-4 py-3 text-sm text-destructive-strong">
                                {getErrorMessage(tasks.error)}
                            </div>
                        ) : (
                            <>
                                {data.topBlockers.map((blocker) => (
                                    <div
                                        key={blocker.taskId}
                                        className="mt-4 flex items-start gap-3 rounded-lg bg-destructive-tint p-4"
                                    >
                                        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive-strong" />
                                        <p className="text-sm text-destructive-strong">
                                            <span className="font-medium">{blocker.title}</span>
                                            {blocker.overdue
                                                ? ` is ${Math.abs(blocker.daysUntilDue)} days late — `
                                                : " is "}
                                            blocking {blocker.blockedCount}{" "}
                                            {blocker.blockedCount === 1 ? "task" : "tasks"}
                                        </p>
                                    </div>
                                ))}

                                {upcoming.length === 0 && data.topBlockers.length === 0 ? (
                                    <p className="mt-4 text-sm text-muted-foreground">
                                        Nothing needs attention right now.
                                    </p>
                                ) : (
                                    <ul className="mt-2 divide-y">
                                        {upcoming.map((task) => (
                                            <li key={task.id} className="flex items-center gap-3 py-3">
                                                <span
                                                    aria-hidden="true"
                                                    className={cn(
                                                        "size-1.5 shrink-0 rounded-full",
                                                        task.overdue
                                                            ? "bg-destructive"
                                                            : task.daysUntilDue <= 7
                                                                ? "bg-warning"
                                                                : "bg-success",
                                                    )}
                                                />
                                                <span className="min-w-0 flex-1 truncate text-sm">{task.title}</span>
                                                {task.assignee && (
                                                    <UserAvatar
                                                        name={task.assignee.fullName}
                                                        className="size-6 text-[10px]"
                                                    />
                                                )}
                                                <span
                                                    className={cn(
                                                        "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
                                                        task.overdue
                                                            ? "bg-destructive-tint text-destructive-strong"
                                                            : task.daysUntilDue <= 7
                                                                ? "bg-warning-tint text-warning-strong"
                                                                : "bg-muted text-muted-foreground",
                                                    )}
                                                >
                                                    {formatCountdown(task.daysUntilDue)}
                                                </span>

                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}
                    </section>
                )}

                <section
                    className={cn(
                        "rounded-lg border bg-card p-5",
                        !canSeeTasks && "lg:col-span-2",
                    )}
                >
                    <div className="flex items-baseline justify-between gap-3">
                        <h2 className="text-[15px] font-semibold">Recent activity</h2>
                        <Link
                            to="activity"
                            className="rounded-md text-xs font-medium text-primary hover:text-primary-hover focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
                        >
                            View all
                        </Link>
                    </div>

                    {data.recentActivity.length === 0 ? (
                        <p className="mt-4 text-sm text-muted-foreground">Nothing yet.</p>
                    ) : (
                        <ul className="mt-4 max-h-[420px] space-y-4 overflow-y-auto pr-1">
                            {data.recentActivity.map((entry) => (
                                <li key={entry.id} className="flex gap-3">
                                    <UserAvatar
                                        name={entry.actorName ?? "?"}
                                        className="mt-0.5 size-6 shrink-0 text-[10px]"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[13px] leading-snug">
                                            <span className="font-medium">{entry.actorName ?? "Someone"}</span>{" "}
                                            <span className="text-foreground-soft">{entry.summary}</span>
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {formatRelativeTime(entry.createdAt)}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}