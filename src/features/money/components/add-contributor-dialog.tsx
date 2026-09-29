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
import { useMembers } from "@/features/members/hooks";
import { useCreateContribution } from "../hooks";

const schema = z
  .object({
    who: z.string(),
    contributorName: z.string().trim().max(160).optional(),
    pledged: z
      .string()
      .trim()
      .refine((v) => v !== "" && !Number.isNaN(Number(v)), "Enter an amount")
      .refine((v) => Number(v) >= 0, "Can't be negative"),
    note: z.string().trim().max(500).optional(),
  })
  .refine(
    (values) => values.who !== "other" || (values.contributorName ?? "").length > 0,
    { message: "Enter their name", path: ["contributorName"] },
  );

type FormValues = z.infer<typeof schema>;

type AddContributorDialogProps = {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddContributorDialog({
  eventId,
  open,
  onOpenChange,
}: AddContributorDialogProps) {
  const createContribution = useCreateContribution(eventId);
  const members = useMembers(eventId);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) reset({ who: "other", contributorName: "", pledged: "0", note: "" });
  }, [open, reset]);

  const who = watch("who");

  async function onSubmit(values: FormValues) {
    try {
      await createContribution.mutateAsync({
        contributorId: values.who !== "other" ? values.who : undefined,
        contributorName: values.who === "other" ? values.contributorName : undefined,
        pledged: Number(values.pledged),
        note: values.note || undefined,
      });

      toast.success("Contributor added");
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add contributor</DialogTitle>
          <DialogDescription>
            Record what someone has promised. You'll add payments as the money arrives.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="who">Who's contributing</Label>
            <Select value={who} onValueChange={(value) => setValue("who", value)}>
              <SelectTrigger id="who" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="other">Someone not on Ventro</SelectItem>
                {members.data?.map((member) => (
                  <SelectItem key={member.userId} value={member.userId}>
                    {member.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {who === "other" && (
            <div className="space-y-1.5">
              <Label htmlFor="contributorName">Their name</Label>
              <Input
                id="contributorName"
                placeholder="Uncle Musa"
                aria-invalid={!!errors.contributorName}
                {...register("contributorName")}
              />
              {errors.contributorName && (
                <p className="text-sm text-destructive-strong">
                  {errors.contributorName.message}
                </p>
              )}
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
            <Input id="note" placeholder="Agreed at the family meeting" {...register("note")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding…" : "Add contributor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}