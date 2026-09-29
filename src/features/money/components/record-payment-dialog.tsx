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
import { getErrorMessage } from "@/lib/api-client";
import { formatMoney } from "@/lib/format";
import { useRecordPayment } from "../hooks";
import {
  PAYMENT_METHOD_LABELS,
  type ContributionView,
  type PaymentMethod,
} from "../types";

const schema = z.object({
  amount: z
    .string()
    .trim()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), "Enter an amount")
    .refine((v) => Number(v) > 0, "Enter an amount greater than zero"),
  paidOn: z.string().min(1, "Pick a date"),
  method: z.string(),
  note: z.string().trim().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

type RecordPaymentDialogProps = {
  eventId: string;
  contribution: ContributionView | null;
  onOpenChange: (open: boolean) => void;
};

export function RecordPaymentDialog({
  eventId,
  contribution,
  onOpenChange,
}: RecordPaymentDialogProps) {
  const recordPayment = useRecordPayment(eventId);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!contribution) return;

    reset({
      amount: String(contribution.outstanding > 0 ? contribution.outstanding : 0),
      paidOn: new Date().toISOString().slice(0, 10),
      method: "TRANSFER",
      note: "",
    });
  }, [contribution, reset]);

  async function onSubmit(values: FormValues) {
    if (!contribution) return;

    try {
      await recordPayment.mutateAsync({
        contributionId: contribution.id,
        body: {
          amount: Number(values.amount),
          paidOn: values.paidOn,
          method: values.method as PaymentMethod,
          note: values.note || undefined,
        },
      });

      toast.success("Payment recorded");
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <Dialog open={Boolean(contribution)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            {contribution
              ? `${contribution.contributorName} — ${formatMoney(
                  contribution.outstanding,
                )} outstanding`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount received</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="1000"
              aria-invalid={!!errors.amount}
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-sm text-destructive-strong">{errors.amount.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="paidOn">Date received</Label>
              <Input id="paidOn" type="date" {...register("paidOn")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="method">How</Label>
              <Select
                value={watch("method")}
                onValueChange={(value) => setValue("method", value)}
              >
                <SelectTrigger id="method" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">
              Reference <span className="text-muted-foreground">optional</span>
            </Label>
            <Input id="note" placeholder="GTB ref 8821994" {...register("note")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Recording…" : "Record payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}