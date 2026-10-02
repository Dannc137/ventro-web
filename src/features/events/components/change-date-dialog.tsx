import { useState } from "react";
import { useParams } from "react-router";
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
import { DatePicker } from "@/components/shared/date-picker";
import { LoadingDots } from "@/components/shared/loading-dots";
import { getErrorMessage } from "@/lib/api-client";
import { daysUntil, formatLongDate } from "@/lib/format";
import { useTasks } from "@/features/tasks/hooks";
import { useChangeEventDate } from "../hooks";
import type { EventDetail } from "../types";

type ChangeDateDialogProps = {
  event: EventDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChangeDateDialog({ event, open, onOpenChange }: ChangeDateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        {open && (
          <ChangeDateBody
            key={event.eventDate}
            event={event}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ChangeDateBody({
  event,
  onDone,
}: {
  event: EventDetail;
  onDone: () => void;
}) {
  const { eventId = "" } = useParams();
  const changeDate = useChangeEventDate(eventId);
  const tasks = useTasks(eventId);

  const [date, setDate] = useState(event.eventDate);

  const allTasks = (tasks.data ?? []).flatMap((bucket) => bucket.tasks);
  const movingCount = allTasks.filter((task) => !task.dateIsFixed).length;
  const fixedCount = allTasks.length - movingCount;

  const shift = date ? daysUntil(date) - daysUntil(event.eventDate) : 0;
  const changed = date !== "" && date !== event.eventDate;

  async function handleSave() {
    try {
      await changeDate.mutateAsync(date);
      toast.success(
        movingCount > 0
          ? `Date changed — ${movingCount} task${
              movingCount === 1 ? "" : "s"
            } rescheduled`
          : "Date changed",
      );
      onDone();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Change the event date</DialogTitle>
        <DialogDescription>
          Currently {formatLongDate(event.eventDate)}.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="eventDate">New date</Label>
          <DatePicker id="eventDate" value={date} onChange={setDate} />
        </div>

        {changed && (
          <div className="space-y-2 rounded-md bg-muted px-4 py-3 text-sm">
            <p className="font-medium">
              Moving {shift > 0 ? "forward" : "back"} by{" "}
              <span className="tabular-nums">{Math.abs(shift)}</span>{" "}
              {Math.abs(shift) === 1 ? "day" : "days"}
            </p>
            <ul className="space-y-0.5 text-muted-foreground">
              <li>
                <span className="tabular-nums">{movingCount}</span>{" "}
                {movingCount === 1 ? "task moves" : "tasks move"} with the event
              </li>
              {fixedCount > 0 && (
                <li>
                  <span className="tabular-nums">{fixedCount}</span> fixed{" "}
                  {fixedCount === 1 ? "task stays" : "tasks stay"} where{" "}
                  {fixedCount === 1 ? "it is" : "they are"}
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!changed || changeDate.isPending}>
          {changeDate.isPending ? (
            <>
              Saving <LoadingDots />
            </>
          ) : (
            "Change date"
          )}
        </Button>
      </DialogFooter>
    </>
  );
}