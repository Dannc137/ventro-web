import { useMemo, useState } from "react";
import { useOutletContext, useParams, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { getErrorMessage } from "@/lib/api-client";
import { can } from "@/lib/permissions";
import type { EventDetail } from "@/features/events/types";
import { useMembers } from "@/features/members/hooks";
import { CreateTaskDialog } from "../components/create-task-dialog";
import { TaskDetailSheet } from "../components/task-detail-sheet";
import { TaskRow } from "../components/task-row";
import { useTasks, useUpdateTask } from "../hooks";
import type { TaskView } from "../types";
import { useAuth } from "@/features/auth";

export function TasksPage() {
    const { eventId = "" } = useParams();
    const event = useOutletContext<EventDetail | undefined>();

    const tasks = useTasks(eventId);
    const members = useMembers(eventId);
    const updateTask = useUpdateTask(eventId);

    const [createOpen, setCreateOpen] = useState(false);
    const [openTaskId, setOpenTaskId] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const { user } = useAuth();
    const canEdit = can(event, "EDIT_TASKS");
    const canEditOwn = can(event, "EDIT_OWN_TASKS");

    const [searchParams] = useSearchParams();

    const [assigneeFilter, setAssigneeFilter] = useState(() => {
        const param = searchParams.get("assignee");
        if (param === "me") return user?.id ?? "all";
        if (param === "all") return "all";
        return canEdit ? "all" : (user?.id ?? "all");
    });

    const allTasks = useMemo(
        () => (tasks.data ?? []).flatMap((bucket) => bucket.tasks),
        [tasks.data],
    );

    const openTask = openTaskId
        ? (allTasks.find((task) => task.id === openTaskId) ?? null)
        : null;

    const buckets = useMemo(() => {
        const raw = tasks.data ?? [];
        const term = search.trim().toLowerCase();

        return raw
            .map((bucket) => ({
                ...bucket,
                tasks: bucket.tasks.filter((task) => {
                    const matchesSearch = term === "" || task.title.toLowerCase().includes(term);
                    const matchesAssignee =
                        assigneeFilter === "all" ||
                        (assigneeFilter === "unassigned" && task.assignee === null) ||
                        task.assignee?.id === assigneeFilter;
                    return matchesSearch && matchesAssignee;
                }),
            }))
            .filter((bucket) => bucket.tasks.length > 0);
    }, [tasks.data, search, assigneeFilter]);

    function handleToggle(task: TaskView) {
        updateTask.mutate(
            {
                taskId: task.id,
                body: { status: task.status === "DONE" ? "TODO" : "DONE" },
            },
            { onError: (error) => toast.error(getErrorMessage(error)) },
        );
    }

    function handleOpen(task: TaskView) {
        setOpenTaskId(task.id);
    }

    if (tasks.isLoading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-9 w-full max-w-md" />
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-11 w-full" />
                ))}
            </div>
        );
    }

    if (tasks.isError) {
        return (
            <div className="rounded-lg border bg-destructive-tint px-4 py-3 text-sm text-destructive-strong">
                {getErrorMessage(tasks.error)}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
                <Input
                    placeholder="Search tasks"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                />

                <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All assignees" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All assignees</SelectItem>
                        {user && <SelectItem value={user.id}>My tasks</SelectItem>}
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {members.data
                            ?.filter((member) => member.userId !== user?.id)
                            .map((member) => (
                                <SelectItem key={member.userId} value={member.userId}>
                                    {member.fullName}
                                </SelectItem>
                            ))}
                    </SelectContent>
                </Select>

                {canEdit && (
                    <Button className="ml-auto" onClick={() => setCreateOpen(true)}>
                        Add task
                    </Button>
                )}
            </div>

            {allTasks.length === 0 ? (
                <EmptyState
                    title="No tasks yet"
                    description="Break the plan into steps so everyone knows what they're doing."
                    action={
                        canEdit ? <Button onClick={() => setCreateOpen(true)}>Add task</Button> : undefined
                    }
                />
            ) : buckets.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                    No tasks match your filters.
                </p>
            ) : (
                buckets.map((bucket) => (
                    <section key={bucket.label}>
                        <div className="flex items-center gap-2 pb-1">
                            <h2 className="text-[13px] font-semibold">{bucket.label}</h2>
                            <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums text-muted-foreground">
                                {bucket.tasks.length}
                            </span>
                        </div>
                        <div className="rounded-lg border bg-card px-4">
                            {bucket.tasks.map((task) => (
                                <TaskRow
                                    key={task.id}
                                    task={task}
                                    canEdit={
                                        canEdit ||
                                        (canEditOwn && task.assignee?.id === user?.id)
                                    }
                                    onToggle={handleToggle}
                                    onOpen={handleOpen}
                                />
                            ))}
                        </div>
                    </section>
                ))
            )}

            <CreateTaskDialog
                eventId={eventId}
                open={createOpen}
                onOpenChange={setCreateOpen}
            />

            <TaskDetailSheet
                task={openTask}
                event={event}
                onOpenChange={(open) => !open && setOpenTaskId(null)}
            />
        </div>
    );
}