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
import { getErrorMessage } from "@/lib/api-client";
import { formatMoney } from "@/lib/format";
import { useUpdateContribution } from "../hooks";
import type { ContributionView } from "../types";

const schema = z.object({
  contributorName: z.string().trim().max(160).optional(),
  pledged: z
    .string()
    .trim()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), "Enter an amount")
    .refine((v) => Number(v) >= 0, "Can't be negative"),
  note: z.string().trim().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

type EditContributorDialogProps = {
  eventId: string;
  contribution: ContributionView | null;
  onOpenChange: (open: boolean) => void;
};

export function EditContributorDialog({
  eventId,
  contribution,
  onOpenChange,
}: EditContributorDialogProps) {
  const updateContribution = useUpdateContribution(eventId);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!contribution) return;

    reset({
      contributorName: contribution.contributorName,
      pledged: String(contribution.pledged),
      note: contribution.note ?? "",
    });
  }, [contribution, reset]);

  const newPledge = Number(watch("pledged") || 0);
  const received = contribution?.received ?? 0;
  const wouldBeExtra = contribution ? newPledge < received : false;

  async function onSubmit(values: FormValues) {
    if (!contribution) return;

    try {
      await updateContribution.mutateAsync({
        contributionId: contribution.id,
        body: {
          contributorName: contribution.onApp ? undefined : values.contributorName,
          pledged: Number(values.pledged),
          note: values.note || undefined,
        },
      });

      toast.success("Contributor updated");
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <Dialog open={Boolean(contribution)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Edit contributor</DialogTitle>
          <DialogDescription>
            This changes what they promised. To fix a payment, use Fix on the payment
            itself.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {contribution && !contribution.onApp && (
            <div className="space-y-1.5">
              <Label htmlFor="contributorName">Name</Label>
              <Input id="contributorName" {...register("contributorName")} />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="pledged">Amount promised</Label>
            <Input
              id="pledged"
              type="number"
              min="0"
              step="1000"
              aria-invalid={!!errors.pledged}
              {...register("pledged")}
            />
            {errors.pledged && (
              <p className="text-sm text-destructive-strong">{errors.pledged.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">
              Note <span className="text-muted-foreground">optional</span>
            </Label>
            <Input id="note" {...register("note")} />
          </div>

          {wouldBeExtra && (
            <p className="rounded-md bg-warning-tint px-3 py-2.5 text-xs text-warning-strong">
              {formatMoney(received)} has already been received from this person.
              Promising {formatMoney(newPledge)} will show them as having paid extra.
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}