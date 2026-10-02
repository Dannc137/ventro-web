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
import { getErrorMessage } from "@/lib/api-client";
import { formatDate, formatMoney } from "@/lib/format";
import { useRecordPayment } from "../hooks";
import type { ContributionView, PaymentView } from "../types";

const schema = z.object({
  actual: z
    .string()
    .trim()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), "Enter an amount")
    .refine((v) => Number(v) >= 0, "Can't be negative"),
  reason: z.string().trim().max(200).optional(),
});

type FormValues = z.infer<typeof schema>;

type CorrectPaymentDialogProps = {
  eventId: string;
  contribution: ContributionView | null;
  payment: PaymentView | null;
  onOpenChange: (open: boolean) => void;
};

export function CorrectPaymentDialog({
  eventId,
  contribution,
  payment,
  onOpenChange,
}: CorrectPaymentDialogProps) {
  const recordPayment = useRecordPayment(eventId);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (payment) reset({ actual: String(payment.amount), reason: "" });
  }, [payment, reset]);

  const actual = Number(watch("actual") || 0);
  const difference = payment ? actual - payment.amount : 0;

  async function onSubmit(values: FormValues) {
    if (!contribution || !payment) return;

    const adjustment = Number(values.actual) - payment.amount;

    if (adjustment === 0) {
      onOpenChange(false);
      return;
    }

    const reason = values.reason?.trim();

    try {
      await recordPayment.mutateAsync({
        contributionId: contribution.id,
        body: {
          amount: adjustment,
          paidOn: payment.paidOn,
          method: payment.method,
          note: `Correction to ${formatMoney(payment.amount)} on ${formatDate(
            payment.paidOn,
          )}${reason ? ` — ${reason}` : ""}`,
        },
      });

      toast.success("Correction recorded");
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <Dialog open={Boolean(payment)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Correct this payment</DialogTitle>
          <DialogDescription>
            {payment
              ? `Recorded as ${formatMoney(payment.amount)} on ${formatDate(payment.paidOn)}.`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="actual">What was the actual amount?</Label>
            <MoneyInput
              control={control}
              name="actual"
              id="actual"
              aria-invalid={!!errors.actual}
            />
            {errors.actual && (
              <p className="text-sm text-destructive-strong">{errors.actual.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reason">
              Why <span className="text-muted-foreground">optional</span>
            </Label>
            <Input id="reason" placeholder="Typed it wrong" {...register("reason")} />
          </div>

          {difference !== 0 && !errors.actual && (
            <p className="rounded-md bg-muted px-3 py-2.5 text-xs text-foreground-soft">
              This adds a correction of{" "}
              <span className="font-medium tabular-nums">
                {difference > 0 ? "+" : "−"}
                {formatMoney(Math.abs(difference))}
              </span>
              . The original entry stays in the history.
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || difference === 0}>
              {isSubmitting ? (
                <>
                  Saving <LoadingDots />
                </>
              ) : (
                "Save correction"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}