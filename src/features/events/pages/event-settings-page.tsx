import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingDots } from "@/components/shared/loading-dots";
import { getErrorMessage } from "@/lib/api-client";
import { formatLongDate } from "@/lib/format";
import { can } from "@/lib/permissions";
import { ArchiveEventDialog } from "../components/archive-event-dialog";
import { ChangeDateDialog } from "../components/change-date-dialog";
import { DeleteEventDialog } from "../components/delete-event-dialog";
import { useUpdateEvent } from "../hooks";
import type { EventDetail } from "../types";
import { CancelEventDialog } from "../components/cancel-event-dialog";
import { useMembers } from "@/features/members/hooks";

const schema = z.object({
  name: z.string().trim().min(1, "Give the event a name").max(160, "That's too long"),
  venue: z.string().trim().max(255, "That's too long").optional(),
});

type FormValues = z.infer<typeof schema>;

export function EventSettingsPage() {
  const { eventId = "" } = useParams();
  const event = useOutletContext<EventDetail | undefined>();
  const navigate = useNavigate();

  const updateEvent = useUpdateEvent(eventId);

  const [dateOpen, setDateOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const canDelete = can(event, "DELETE_EVENT");
  const isArchived = event?.status === "ARCHIVED";
  const members = useMembers(eventId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (event) reset({ name: event.name, venue: event.venue ?? "" });
  }, [event, reset]);

  async function onSubmit(values: FormValues) {
    try {
      await updateEvent.mutateAsync({
        name: values.name,
        venue: values.venue ?? "",
      });
      toast.success("Event updated");
      reset(values);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  if (!event) return null;

  return (
    <div className="max-w-2xl space-y-6">
      {isArchived && (
        <div className="rounded-lg border bg-muted px-4 py-3 text-sm">
          <p className="font-medium">This event is archived</p>
          <p className="mt-0.5 text-muted-foreground">
            It's hidden from your sidebar. Everything in it is kept.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setArchiveOpen(true)}
          >
            Restore event
          </Button>
        </div>
      )}

      <section className="rounded-lg border bg-card p-5">
        <h2 className="text-[15px] font-semibold">Details</h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">Event name</Label>
            <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive-strong">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="venue">
              Venue <span className="text-muted-foreground">optional</span>
            </Label>
            <Input id="venue" placeholder="Eko Hotel, Lagos" {...register("venue")} />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? (
                <>
                  Saving <LoadingDots />
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border bg-card p-5">
        <h2 className="text-[15px] font-semibold">Event date</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tasks scheduled relative to the event move with it. Tasks with a fixed date
          stay put.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md bg-muted px-4 py-3">
          <p className="font-medium tabular-nums">{formatLongDate(event.eventDate)}</p>
          <Button variant="outline" size="sm" onClick={() => setDateOpen(true)}>
            Change date
          </Button>
        </div>
      </section>

      {!isArchived && (
        <section className="rounded-lg border bg-card p-5">
          <h2 className="text-[15px] font-semibold">Archive</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Hides the event from your sidebar without deleting anything. You can restore
            it at any time.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setArchiveOpen(true)}
          >
            Archive event
          </Button>
        </section>
      )}

      {event.myRole === "OWNER" && event.status !== "CANCELLED" && (
  <section className="rounded-lg border p-5">
    <h2 className="text-[15px] font-semibold">Cancel this event</h2>
    <p className="mt-1 text-sm text-foreground-soft">
      Tells everyone by email and makes the event read-only. You can restore it
      later.
    </p>
    <Button
      variant="outline"
      className="mt-4"
      onClick={() => setCancelOpen(true)}
    >
      Cancel event
    </Button>
  </section>
)}

      {canDelete && (
        <section className="rounded-lg border border-destructive/30 bg-card p-5">
          <h2 className="text-[15px] font-semibold text-destructive-strong">
            Delete this event
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Permanent, and only possible while the event is empty. Once it has tasks,
            budget items or contributions, archive it instead.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="mt-4 text-destructive-strong hover:bg-destructive-tint"
          >
            Delete event
          </Button>
        </section>
      )}

      <ChangeDateDialog
        event={event}
        open={dateOpen}
        onOpenChange={setDateOpen}
      />

      <ArchiveEventDialog
        event={event}
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
      />

      <CancelEventDialog
        eventId={event.id}
        eventName={event.name}
        memberCount={members.data?.length ?? 0}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
      />

      <DeleteEventDialog
        event={event}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => navigate("/events", { replace: true })}
      />
    </div>
  );
}