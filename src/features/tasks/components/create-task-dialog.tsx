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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/shared/date-picker";
import { LoadingDots } from "@/components/shared/loading-dots";
import { getErrorMessage } from "@/lib/api-client";
import { useMembers } from "@/features/members/hooks";
import { useCreateTask } from "../hooks";
import { CategoryPicker } from "@/components/shared/category-picker";
import { useTasks } from "../hooks";

const schema = z.object({
    title: z.string().trim().min(1, "Give the task a title").max(200, "That's too long"),
    category: z.string().trim().max(60).optional(),
    dueDate: z.string().min(1, "Pick a due date"),
    assigneeId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type CreateTaskDialogProps = {
    eventId: string;
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

export function CreateTaskDialog({ eventId, open, onOpenChange }: CreateTaskDialogProps) {
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
        defaultValues: { assigneeId: "unassigned" },
    });

    useEffect(() => {
        if (open) reset({ assigneeId: "unassigned" });
    }, [open, reset]);

    async function onSubmit(values: FormValues) {
        try {
            await createTask.mutateAsync({
                title: values.title,
                category: values.category || undefined,
                fixedDate: values.dueDate,
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
                        Tasks with a fixed date stay put if the event date changes.
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
                        <Label htmlFor="dueDate">Due date</Label>
                        <DatePicker
                            id="dueDate"
                            value={watch("dueDate") ?? ""}
                            onChange={(next) => setValue("dueDate", next, { shouldValidate: true })}
                            aria-invalid={!!errors.dueDate}
                        />
                        {errors.dueDate && (
                            <p className="text-sm text-destructive-strong">{errors.dueDate.message}</p>
                        )}
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