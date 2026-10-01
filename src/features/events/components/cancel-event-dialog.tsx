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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/api-client";
import { useCancelEvent } from "../hooks";

type CancelEventDialogProps = {
  eventId: string;
  eventName: string;
  memberCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CancelEventDialog({
  eventId,
  eventName,
  memberCount,
  open,
  onOpenChange,
}: CancelEventDialogProps) {
  const cancelEvent = useCancelEvent(eventId);
  const [reason, setReason] = useState("");

  function handleCancel() {
    cancelEvent.mutate(reason.trim() || null, {
      onSuccess: () => {
        toast.success("Event cancelled");
        onOpenChange(false);
        setReason("");
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel {eventName}?</DialogTitle>
          <DialogDescription>
            Everyone on the event will be told by email, and it becomes read-only.
            Nothing is deleted — the tasks, budget and payment records all stay
            visible.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="reason">Reason (optional)</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Venue flooded — we're looking at new dates."
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground">
            This goes in the email
            {memberCount > 1 ? ` to all ${memberCount} people` : ""}.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep it
          </Button>
          <Button
            onClick={handleCancel}
            disabled={cancelEvent.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive-strong"
          >
            {cancelEvent.isPending ? "Cancelling…" : "Cancel event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}