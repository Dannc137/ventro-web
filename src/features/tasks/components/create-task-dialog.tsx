import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/shared/date-picker";
import { LoadingDots } from "@/components/shared/loading-dots";
import { getErrorMessage } from "@/lib/api-client";
import { formatLongDate } from "@/lib/format";
import { useMembers } from "@/features/members/hooks";
import type { EventDetail } from "@/features/events/types";
import { useCreateTask } from "../hooks";
import { CategoryPicker } from "@/components/shared/category-picker";
import { useTasks } from "../hooks";

const schema = z
    .object({
        title: z.string().trim().min(1, "Give the task a title").max(200, "That's too long"),
        description: z.string().trim().max(2000, "That's too long").optional(),
        category: z.string().trim().max(60).optional(),
        scheduleMode: z.enum(["relative", "fixed"]),
        offsetDays: z.string().optional(),
        fixedDate: z.string().optional(),
        assigneeId: z.string().optional(),
    })
    .superRefine((values, ctx) => {
        if (values.scheduleMode === "relative") {
            const n = Number(values.offsetDays);
            if (!values.offsetDays || Number.isNaN(n) || !Number.isInteger(n) || n < 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["offsetDays"],
                    message: "Enter a whole number of days",
                });
            }
        } else if (!values.fixedDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["fixedDate"],
                message: "Pick a due date",
            });
        }
    });

type FormValues = z.infer<typeof schema>;

type CreateTaskDialogProps = {
    eventId: string;
    event: EventDetail | undefined;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const STARTER_CATEGORIES = [
    "Venue",
    "Catering",
    "Media",
    "Logistics",
    "Guests",
    "Admin",
];

/** Add (possibly negative) days to an ISO date, in local time. */
function addDays(isoDate: string, days: number): string {
    const [y, m, d] = isoDate.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function CreateTaskDialog({
    eventId,
    event,
    open,
    onOpenChange,
}: CreateTaskDialogProps) {
    const createTask = useCreateTask(eventId);
    const members = useMembers(eventId);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { assigneeId: "unassigned", scheduleMode: "relative" },
    });

    useEffect(() => {
        if (open) reset({ assigneeId: "unassigned", scheduleMode: "relative" });
    }, [open, reset]);

    async function onSubmit(values: FormValues) {
        try {
            await createTask.mutateAsync({
                title: values.title,
                description: values.description || undefined,
                category: values.category || undefined,
                ...(values.scheduleMode === "relative"
                    ? { offsetDays: -Number(values.offsetDays) }
                    : { fixedDate: values.fixedDate }),
                assigneeId:
                    values.assigneeId && values.assigneeId !== "unassigned"
                        ? values.assigneeId
                        : undefined,
            });

            toast.success("Task added");
            onOpenChange(false);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    }

    const scheduleMode = watch("scheduleMode");
    const offsetDaysRaw = watch("offsetDays");
    const offsetNum = Number(offsetDaysRaw);
    const offsetValid = offsetDaysRaw !== undefined && offsetDaysRaw !== "" && Number.isInteger(offsetNum) && offsetNum >= 0;

    const tasks = useTasks(eventId);

    const existingCategories = Array.from(
        new Set(
            (tasks.data ?? [])
                .flatMap((bucket) => bucket.tasks)
                .map((task) => task.category)
                .filter((category): category is string => Boolean(category)),
        ),
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Add task</DialogTitle>
                    <DialogDescription>
                        Tasks scheduled relative to the event move with it. Pick a specific date
                        instead if this one shouldn't move.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                    <div className="space-y-1.5">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="Confirm the caterer"
                            aria-invalid={!!errors.title}
                            {...register("title")}
                        />
                        {errors.title && (
                            <p className="text-sm text-destructive-strong">{errors.title.message}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="description">
                            Description <span className="text-muted-foreground">optional</span>
                        </Label>
                        <Textarea
                            id="description"
                            rows={3}
                            placeholder="Any extra detail worth noting"
                            {...register("description")}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Due</Label>
                        <Tabs
                            value={scheduleMode}
                            onValueChange={(value) =>
                                setValue("scheduleMode", value as "relative" | "fixed", {
                                    shouldValidate: true,
                                })
                            }
                        >
                            <TabsList className="w-full">
                                <TabsTrigger value="relative">Before the event</TabsTrigger>
                                <TabsTrigger value="fixed">Specific date</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {scheduleMode === "relative" ? (
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min={0}
                                        step={1}
                                        inputMode="numeric"
                                        aria-label="Days before the event"
                                        aria-invalid={!!errors.offsetDays}
                                        className="w-24"
                                        {...register("offsetDays")}
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        days before the event
                                    </span>
                                </div>
                                {errors.offsetDays ? (
                                    <p className="text-sm text-destructive-strong">
                                        {errors.offsetDays.message}
                                    </p>
                                ) : (
                                    event &&
                                    offsetValid && (
                                        <p className="text-xs text-muted-foreground">
                                            {offsetNum} {offsetNum === 1 ? "day" : "days"} before ·{" "}
                                            {formatLongDate(addDays(event.eventDate, -offsetNum))}
                                        </p>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <DatePicker
                                    aria-label="Due date"
                                    value={watch("fixedDate") ?? ""}
                                    onChange={(next) =>
                                        setValue("fixedDate", next, { shouldValidate: true })
                                    }
                                    disablePast
                                    aria-invalid={!!errors.fixedDate}
                                />
                                {errors.fixedDate && (
                                    <p className="text-sm text-destructive-strong">
                                        {errors.fixedDate.message}
                                    </p>
                                )}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            {scheduleMode === "relative"
                                ? "This task moves with the event if the date changes."
                                : "This task stays on this date even if the event moves."}
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="category">
                            Category <span className="text-muted-foreground">optional</span>
                        </Label>
                        <CategoryPicker
                            id="category"
                            value={watch("category") ?? ""}
                            onChange={(next) => setValue("category", next)}
                            existing={existingCategories}
                            starters={STARTER_CATEGORIES}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="assignee">Assignee</Label>
                        <Select
                            value={watch("assigneeId")}
                            onValueChange={(value) => setValue("assigneeId", value)}
                        >
                            <SelectTrigger id="assignee" className="w-full">
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
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    Adding <LoadingDots />
                                </>
                            ) : (
                                "Add task"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}