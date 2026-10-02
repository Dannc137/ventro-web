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
import { LoadingDots } from "@/components/shared/loading-dots";
import { ShareLink } from "@/components/shared/share-link";
import { getErrorMessage } from "@/lib/api-client";
import { useDisableSharing, useEnableSharing } from "../hooks";

type ShareClientDialogProps = {
  eventName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ShareClientDialog({
  eventName,
  open,
  onOpenChange,
}: ShareClientDialogProps) {
  const { eventId = "" } = useParams();
  const enableSharing = useEnableSharing(eventId);
  const disableSharing = useDisableSharing(eventId);

  const [token, setToken] = useState<string | null>(null);

  const url = token ? `${window.location.origin}/share/${token}` : "";

  async function handleCreate() {
    try {
      const result = await enableSharing.mutateAsync();
      setToken(result.token);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  function handleDisable() {
    disableSharing.mutate(undefined, {
      onSuccess: () => {
        setToken(null);
        toast.success("Sharing turned off");
        onOpenChange(false);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Share with your client</DialogTitle>
          <DialogDescription>
            A read-only summary: progress, key dates and three budget figures. No task
            list, no vendors, no contributor details.
          </DialogDescription>
        </DialogHeader>

        {token ? (
          <div className="space-y-4">
            <ShareLink
              url={url}
              message={`Here's how ${eventName} is coming along:`}
              shareTitle={eventName}
            />
            <p className="rounded-md bg-warning-tint px-3 py-2.5 text-xs text-warning-strong">
              Anyone with this link can see the summary — no sign-in needed. Turn
              sharing off to invalidate it.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Create a link you can send on WhatsApp or by email.
          </p>
        )}

        <DialogFooter className="sm:justify-between">
          {token ? (
            <Button
              variant="outline"
              onClick={handleDisable}
              disabled={disableSharing.isPending}
              className="text-destructive-strong hover:bg-destructive-tint"
            >
              Turn off sharing
            </Button>
          ) : (
            <span />
          )}
          <Button
            onClick={token ? () => onOpenChange(false) : handleCreate}
            disabled={enableSharing.isPending}
          >
            {enableSharing.isPending ? (
              <>
                Creating <LoadingDots />
              </>
            ) : token ? (
              "Done"
            ) : (
              "Create link"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}