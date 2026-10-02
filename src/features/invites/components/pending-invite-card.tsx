import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LoadingDots } from "@/components/shared/loading-dots";
import { RoleBadge } from "@/components/shared/role-badge";
import { getErrorMessage } from "@/lib/api-client";
import { formatLongDate } from "@/lib/format";
import { useAcceptInvite, useDeclineInvite } from "../hooks";
import type { PendingInvite } from "../types";

export function PendingInviteCard({ invite }: { invite: PendingInvite }) {
  const navigate = useNavigate();
  const accept = useAcceptInvite();
  const decline = useDeclineInvite();

  const busy = accept.isPending || decline.isPending;

  async function handleAccept() {
    try {
      const result = await accept.mutateAsync(invite.id);
      toast.success(`You're in ${result.eventName}`);
      navigate(`/events/${result.eventId}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  function handleDecline() {
    decline.mutate(invite.id, {
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-primary-tint p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-medium text-primary-strong">
          {invite.invitedByName} invited you
        </p>
        <h2 className="mt-0.5 truncate text-[15px] font-semibold">{invite.eventName}</h2>
        <p className="mt-1 truncate text-xs text-foreground-soft">
          {formatLongDate(invite.eventDate)}
          {invite.venue ? ` · ${invite.venue}` : ""}
        </p>
        <div className="mt-2">
          <RoleBadge role={invite.role} className="border-primary/30 bg-background" />
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        <Button variant="ghost" size="sm" onClick={handleDecline} disabled={busy}>
          {decline.isPending ? (
            <>
              Declining <LoadingDots />
            </>
          ) : (
            "Decline"
          )}
        </Button>
        <Button variant="outline" size="sm" onClick={() => void handleAccept()} disabled={busy}>
          {accept.isPending ? (
            <>
              Joining <LoadingDots />
            </>
          ) : (
            "Accept"
          )}
        </Button>
      </div>
    </div>
  );
}
