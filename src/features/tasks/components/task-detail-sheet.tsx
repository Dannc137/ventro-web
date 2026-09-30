import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { CommentThread } from "@/features/comments/components/comment-thread";
import { getErrorMessage } from "@/lib/api-client";
import { daysUntil, formatLongDate } from "@/lib/format";
import { can } from "@/lib/permissions";
import type { EventDetail } from "@/features/events/types";
import { useMembers } from "@/features/members/hooks";
import { useDeleteTask, useUpdateTask } from "../hooks";
import type { TaskStatus, TaskView } from "../types";
import { useMarkCommentsRead, useComments } from "@/features/comments/hooks";

const STATUSES: { value: TaskStatus; label: string }[] = [
    { value: "TODO", label: "To do" },
    { value: "IN_PROGRESS", label: "In progress" },
    { value: "BLOCKED", label: "Blocked" },
    { value: "DONE", label: "Done" },
];

type TaskDetailSheetProps = {
    task: TaskView | null;
    event: EventDetail | undefined;
    onOpenChange: (open: boolean) => void;
};

export function TaskDetailSheet({ task, event, onOpenChange }: TaskDetailSheetProps) {
    return (
        <Sheet open={Boolean(task)} onOpenChange={onOpenChange}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-[480px]">
                <SheetTitle className="sr-only">Task detail</SheetTitle>
                {task && (
                    <TaskDetailBody
                        key={task.id}
                        task={task}
                        event={event}
                        onClose={() => onOpenChange(false)}
                    />
                )}
            </SheetContent>
        </Sheet>
    );
}

type TaskDetailBodyProps = {
    task: TaskView;
    event: EventDetail | undefined;
    onClose: () => void;
};

function TaskDetailBody({ task, event, onClose }: TaskDetailBodyProps) {
    const eventId = event?.id ?? "";
    const updateTask = useUpdateTask(eventId);
    const deleteTask = useDeleteTask(eventId);
    const members = useMembers(eventId);

    const [title, setTitle] = useState(task.title);

    const canEdit = can(event?.permissions, "EDIT_TASKS");
    const daysBeforeEvent = event
        ? daysUntil(task.dueDate) - daysUntil(event.eventDate)
        : 0;

    function patch(body: Parameters<typeof updateTask.mutate>[0]["body"]) {
        updateTask.mutate(
            { taskId: task.id, body },
            { onError: (error) => toast.error(getErrorMessage(error)) },
        );
    }

    function handleDelete() {
        deleteTask.mutate(task.id, {
            onSuccess: () => {
                toast.success("Task deleted");
                onClose();
            },
            onError: (error) => toast.error(getErrorMessage(error)),
        });
    }

    const markRead = useMarkCommentsRead(eventId);

    const comments = useComments(eventId, "TASK", task.id);

    useEffect(() => {
        if (comments.data && comments.data.length > 0) {
            markRead.mutate({ entityType: "TASK", entityId: task.id });
        }
    }, [comments.data?.length]);

    return (
        <>
            <SheetHeader className="pr-10">
                <Input
                    value={title}
                    disabled={!canEdit}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => {
                        const trimmed = title.trim();
                        if (trimmed && trimmed !== task.title) patch({ title: trimmed });
                    }}
                    placeholder="Task title"
                    className="h-auto rounded-md border-0 px-2 py-1 -ml-2 text-lg font-semibold shadow-none hover:bg-muted focus-visible:bg-card focus-visible:ring-[3px] focus-visible:ring-ring/40"
                />
                {canEdit && (
                    <p className="px-2 -ml-2 text-xs text-muted-foreground">
                        Click the title to rename
                    </p>
                )}
            </SheetHeader>

            <div className="space-y-5 px-4 pb-6">
                <div className="grid grid-cols-[100px_1fr] items-center gap-y-3 text-[13px]">
                    <span className="text-muted-foreground">Status</span>
                    <Select
                        value={task.status}
                        disabled={!canEdit}
                        onValueChange={(value) => patch({ status: value as TaskStatus })}
                    >
                        <SelectTrigger className="h-8 w-[160px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUSES.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <span className="text-muted-foreground">Assignee</span>
                    <Select
                        value={task.assignee?.id ?? "unassigned"}
                        disabled={!canEdit}
                        onValueChange={(value) =>
                            patch({ assigneeId: value === "unassigned" ? undefined : value })
                        }
                    >
                        <SelectTrigger className="h-8 w-[200px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {members.data?.map((member) => (
                                <SelectItem key={member.userId} value={member.userId}>
                                    {member.fullName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <span className="self-start pt-2 text-muted-foreground">Due</span>
                    <div>
                        <Input
                            type="date"
                            value={task.dueDate}
                            disabled={!canEdit}
                            onChange={(e) => {
                                const next = e.target.value;
                                if (!next) return;
                                if (task.dateIsFixed || !event) {
                                    patch({ fixedDate: next });
                                } else {
                                    patch({ offsetDays: daysUntil(next) - daysUntil(event.eventDate) });
                                }
                            }}
                            className="h-8 w-[180px]"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                            {formatLongDate(task.dueDate)}
                            {!task.dateIsFixed && event
                                ? ` · ${Math.abs(daysBeforeEvent)} days before the event`
                                : ""}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md bg-muted px-3 py-2.5">
                    <Switch
                        id="fixed"
                        checked={task.dateIsFixed}
                        disabled={!canEdit}
                        onCheckedChange={(checked: boolean) => {
                            if (checked) {
                                patch({ fixedDate: task.dueDate });
                            } else if (event) {
                                patch({
                                    offsetDays: daysUntil(task.dueDate) - daysUntil(event.eventDate),
                                });
                            }
                        }}
                    />
                    <Label htmlFor="fixed" className="text-[13px]">
                        Keep this date fixed
                    </Label>
                    <span className="w-full text-xs text-muted-foreground sm:ml-auto sm:w-auto">
                        Fixed dates don't move when the event date changes
                    </span>
                </div>

                {(task.blockedByCount > 0 || task.blockingCount > 0) && (
                    <div className="flex gap-6 text-[13px]">
                        {task.blockedByCount > 0 && (
                            <p>
                                <span className="text-muted-foreground">Blocked by</span>{" "}
                                <span className="font-medium tabular-nums">{task.blockedByCount}</span>
                            </p>
                        )}
                        {task.blockingCount > 0 && (
                            <p>
                                <span className="text-muted-foreground">Blocking</span>{" "}
                                <span className="font-medium tabular-nums">{task.blockingCount}</span>
                            </p>
                        )}
                    </div>
                )}

                <div className="border-t pt-5">
                    <CommentThread
                        eventId={eventId}
                        entityType="TASK"
                        entityId={task.id}
                        permissions={event?.permissions}
                    />
                </div>

                {canEdit && (
                    <div className="border-t pt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDelete}
                            className="text-destructive-strong hover:bg-destructive-tint"
                        >
                            <Trash2 className="size-3.5" />
                            Delete task
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}