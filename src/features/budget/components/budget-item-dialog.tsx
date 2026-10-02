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
import { LoadingDots } from "@/components/shared/loading-dots";
import { MoneyInput } from "@/components/shared/money-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getErrorMessage } from "@/lib/api-client";
import { useMembers } from "@/features/members/hooks";
import {
  useCreateBudgetItem,
  useDeleteBudgetItem,
  useUpdateBudgetItem,
} from "../hooks";
import type { BudgetItemView } from "../types";
import { CategoryPicker } from "@/components/shared/category-picker";
import { useBudget } from "../hooks";

const STARTER_CATEGORIES = [
  "Venue",
  "Catering",
  "Media",
  "Logistics",
  "Decor",
  "Miscellaneous",
];

const amount = z
  .string()
  .trim()
  .refine((value) => value !== "" && !Number.isNaN(Number(value)), "Enter a number")
  .refine((value) => Number(value) >= 0, "Can't be negative");

const schema = z
  .object({
    label: z.string().trim().min(1, "Give the item a name").max(200),
    category: z.string().trim().max(60).optional(),
    vendorName: z.string().trim().max(160).optional(),
    planned: amount,
    committed: amount,
    paid: amount,
    paidById: z.string().optional(),
  })
  .refine((values) => Number(values.paid) <= Number(values.committed), {
    message: "Paid can't be more than committed",
    path: ["paid"],
  });

type FormValues = z.infer<typeof schema>;

type BudgetItemDialogProps = {
  eventId: string;
  item: BudgetItemView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BudgetItemDialog({
  eventId,
  item,
  open,
  onOpenChange,
}: BudgetItemDialogProps) {
  const createItem = useCreateBudgetItem(eventId);
  const updateItem = useUpdateBudgetItem(eventId);
  const deleteItem = useDeleteBudgetItem(eventId);
  const members = useMembers(eventId);


  const budget = useBudget(eventId);

  const existingCategories = (budget.data?.categories ?? []).map((group) => group.category);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!open) return;

    reset({
      label: item?.label ?? "",
      category: item?.category ?? "",
      vendorName: item?.vendorName ?? "",
      planned: String(item?.planned ?? 0),
      committed: String(item?.committed ?? 0),
      paid: String(item?.paid ?? 0),
      paidById: item?.paidBy?.id ?? "none",
    });
  }, [open, item, reset]);

  async function onSubmit(values: FormValues) {
    const body = {
      label: values.label,
      category: values.category || undefined,
      vendorName: values.vendorName || undefined,
      planned: Number(values.planned),
      committed: Number(values.committed),
      paid: Number(values.paid),
      paidById:
        values.paidById && values.paidById !== "none" ? values.paidById : undefined,
    };

    try {
      if (item) {
        await updateItem.mutateAsync({ itemId: item.id, body });
        toast.success("Item updated");
      } else {
        await createItem.mutateAsync(body);
        toast.success("Item added");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  function handleDelete() {
    if (!item) return;

    deleteItem.mutate(item.id, {
      onSuccess: () => {
        toast.success("Item deleted");
        onOpenChange(false);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{item ? "Edit item" : "Add budget item"}</DialogTitle>
          <DialogDescription>
            Planned is your estimate. Committed is what you've agreed. Paid is what's
            actually left your hands.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="label">Item</Label>
            <Input
              id="label"
              placeholder="Venue hire"
              aria-invalid={!!errors.label}
              {...register("label")}
            />
            {errors.label && (
              <p className="text-sm text-destructive-strong">{errors.label.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <CategoryPicker
              id="category"
              value={watch("category") ?? ""}
              onChange={(next) => setValue("category", next)}
              existing={existingCategories}
              starters={STARTER_CATEGORIES}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="planned">Planned</Label>
              <MoneyInput control={control} name="planned" id="planned" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="committed">Committed</Label>
              <MoneyInput control={control} name="committed" id="committed" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="paid">Paid</Label>
              <MoneyInput
                control={control}
                name="paid"
                id="paid"
                aria-invalid={!!errors.paid}
              />
            </div>
          </div>

          {errors.paid && (
            <p className="text-sm text-destructive-strong">{errors.paid.message}</p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="paidBy">Paid by</Label>
            <Select
              value={watch("paidById")}
              onValueChange={(value) => setValue("paidById", value)}
            >
              <SelectTrigger id="paidBy" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not paid yet</SelectItem>
                {members.data?.map((member) => (
                  <SelectItem key={member.userId} value={member.userId}>
                    {member.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Who actually paid the vendor. Used to work out who's owed what.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            {item ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                className="text-destructive-strong hover:bg-destructive-tint"
              >
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    Saving <LoadingDots />
                  </>
                ) : item ? (
                  "Save changes"
                ) : (
                  "Add item"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}