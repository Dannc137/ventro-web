import { useState } from "react";
import { toast } from "sonner";
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
import { useDeleteEvent } from "../hooks";
import type { EventDetail } from "../types";

type DeleteEventDialogProps = {
  event: EventDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
};

export function DeleteEventDialog({
  event,
  open,
  onOpenChange,
  onDeleted,
}: DeleteEventDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        {open && (
          <DeleteEventBody
            event={event}
            onCancel={() => onOpenChange(false)}
            onDeleted={() => {
              onOpenChange(false);
              onDeleted();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function DeleteEventBody({
  event,
  onCancel,
  onDeleted,
}: {
  event: EventDetail;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const deleteEvent = useDeleteEvent();
  const [confirmation, setConfirmation] = useState("");

  const matches = confirmation.trim() === event.name;

  function handleDelete() {
    deleteEvent.mutate(event.id, {
      onSuccess: () => {
        toast.success("Event deleted");
        onDeleted();
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Delete {event.name}?</DialogTitle>
        <DialogDescription>
          This can't be undone. If the event has any tasks, budget items or
          contributions, archive it instead.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-1.5">
        <Label htmlFor="confirmation">
          Type <span className="font-semibold">{event.name}</span> to confirm
        </Label>
        <Input
          id="confirmation"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          autoComplete="off"
        />
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          disabled={!matches || deleteEvent.isPending}
          className="bg-destructive text-white hover:bg-destructive/90"
        >
          {deleteEvent.isPending ? "Deleting…" : "Delete event"}
        </Button>
      </DialogFooter>
    </>
  );
}