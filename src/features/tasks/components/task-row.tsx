import { Link2, MessageSquare, Pin } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TaskView } from "../types";

type TaskRowProps = {
    task: TaskView;
    canEdit: boolean;
    onToggle: (task: TaskView) => void;
    onOpen: (task: TaskView) => void;
};

export function TaskRow({ task, canEdit, onToggle, onOpen }: TaskRowProps) {
    const done = task.status === "DONE";

    const dueTone = done
        ? "bg-muted text-muted-foreground"
        : task.overdue
            ? "bg-destructive-tint text-destructive-strong"
            : task.daysUntilDue <= 7
                ? "bg-warning-tint text-warning-strong"
                : "bg-muted text-muted-foreground";

    const dueLabel = task.overdue
        ? `Overdue by ${Math.abs(task.daysUntilDue)} days`
        : task.daysUntilDue === 0
            ? "Today"
            : task.daysUntilDue === 1
                ? "Tomorrow"
                : formatDate(task.dueDate);

    const statusBadge =
        task.status === "IN_PROGRESS"
            ? { label: "In progress", tone: "bg-primary-tint text-primary-strong" }
            : task.status === "BLOCKED"
                ? { label: "Blocked", tone: "bg-warning-tint text-warning-strong" }
                : null;

    return (
        <div className="flex items-center gap-3 border-b px-1 py-3 last:border-b-0 hover:bg-background/60">
            <Checkbox
                checked={done}
                disabled={!canEdit}
                onCheckedChange={() => onToggle(task)}
                aria-label={done ? `Mark ${task.title} as not done` : `Mark ${task.title} as done`}
            />

            <button
                type="button"
                onClick={() => onOpen(task)}
                className={cn(
                    "min-w-0 flex-1 truncate text-left text-sm transition-colors hover:text-primary",
                    "focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none",
                    done && "text-muted-foreground line-through",
                )}
            >
                {task.title}
            </button>

            {statusBadge && !done && (
                <span
                    className={cn(
                        "hidden shrink-0 rounded-full px-2 py-0.5 text-xs font-medium sm:inline-flex",
                        statusBadge.tone,
                    )}
                >
                    {statusBadge.label}
                </span>
            )}

            {task.blockingCount > 0 && (
                <span
                    className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:inline-flex"
                    title={`Blocking ${task.blockingCount} tasks`}
                >
                    <Link2 className="size-3.5" />
                    {task.blockingCount}
                </span>
            )}

            {task.unreadComments > 0 && (
                <span
                    className="flex shrink-0 items-center gap-1 rounded-full bg-primary-tint px-1.5 py-0.5 text-xs font-medium text-primary-strong tabular-nums"
                    title={`${task.unreadComments} new comments`}
                >
                    <MessageSquare className="size-3" />
                    {task.unreadComments}
                </span>
            )}

            {task.dateIsFixed && (
                <Pin
                    className="hidden size-3.5 shrink-0 text-muted-foreground sm:block"
                    aria-label="Fixed date"
                />
            )}

            {task.assignee && (
                <UserAvatar name={task.assignee.fullName} className="size-6 shrink-0 text-[10px]" />
            )}

            <span
                className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
                    dueTone,
                )}
            >
                {dueLabel}
            </span>
        </div>
    );
}