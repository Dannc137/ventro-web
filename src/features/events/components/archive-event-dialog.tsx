import { useParams } from "react-router";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getErrorMessage } from "@/lib/api-client";
import { useSetEventArchived } from "../hooks";
import type { EventDetail } from "../types";

type ArchiveEventDialogProps = {
  event: EventDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ArchiveEventDialog({
  event,
  open,
  onOpenChange,
}: ArchiveEventDialogProps) {
  const { eventId = "" } = useParams();
  const setArchived = useSetEventArchived(eventId);

  const isArchived = event.status === "ARCHIVED";

  function handleConfirm() {
    setArchived.mutate(!isArchived, {
      onSuccess: () => {
        toast.success(isArchived ? "Event restored" : "Event archived");
        onOpenChange(false);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isArchived ? `Restore ${event.name}?` : `Archive ${event.name}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isArchived
              ? "It'll appear in your sidebar again."
              : "It'll be hidden from your sidebar, but everything in it is kept. You can restore it later."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            {isArchived ? "Restore" : "Archive"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}