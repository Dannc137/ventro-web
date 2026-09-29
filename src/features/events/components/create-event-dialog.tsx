import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
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
import { useCreateEvent } from "../hooks";

const schema = z.object({
  name: z.string().trim().min(1, "Give your event a name").max(160, "That's too long"),
  eventDate: z.string().min(1, "Pick a date"),
  venue: z.string().trim().max(255, "That's too long").optional(),
});

type FormValues = z.infer<typeof schema>;

type CreateEventDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateEventDialog({ open, onOpenChange }: CreateEventDialogProps) {
  const navigate = useNavigate();
  const createEvent = useCreateEvent();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  async function onSubmit(values: FormValues) {
    try {
      const created = await createEvent.mutateAsync({
        name: values.name,
        eventDate: values.eventDate,
        venue: values.venue || undefined,
      });

      toast.success(`${created.name} created`);
      onOpenChange(false);
      navigate(`/events/${created.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>New event</DialogTitle>
          <DialogDescription>
            You can change any of this later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">Event name</Label>
            <Input
              id="name"
              placeholder="Okafor–Eze Wedding"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive-strong">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="eventDate">Event date</Label>
            <Input
              id="eventDate"
              type="date"
              aria-invalid={!!errors.eventDate}
              {...register("eventDate")}
            />
            {errors.eventDate && (
              <p className="text-sm text-destructive-strong">
                {errors.eventDate.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="venue">
              Venue <span className="text-muted-foreground">optional</span>
            </Label>
            <Input
              id="venue"
              placeholder="Eko Hotel, Lagos"
              aria-invalid={!!errors.venue}
              {...register("venue")}
            />
            {errors.venue && (
              <p className="text-sm text-destructive-strong">{errors.venue.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}