import { useState } from "react";
import { useOutletContext, useParams } from "react-router";
import { MoreHorizontal } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { RoleBadge } from "@/components/shared/role-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { can } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { EventDetail, EventRole } from "@/features/events/types";
import { InviteDialog } from "../components/invite-dialog";
import {
  useChangeMemberRole,
  useMembers,
  useRemoveMember,
  useRevokeInvite,
} from "../hooks";
import type { MemberView } from "../types";

export function MembersPage() {
  const { eventId = "" } = useParams();
  const event = useOutletContext<EventDetail | undefined>();

  const members = useMembers(eventId);
  const changeRole = useChangeMemberRole(eventId);
  const removeMember = useRemoveMember(eventId);
  const revokeInvite = useRevokeInvite(eventId);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [removing, setRemoving] = useState<MemberView | null>(null);

  const canManage = can(event, "MANAGE_MEMBERS");

  function handleRoleChange(member: MemberView, role: EventRole) {
    if (!member.memberId) return;

    changeRole.mutate(
      { memberId: member.memberId, role },
      {
        onSuccess: () => toast.success(`${member.fullName} is now a ${role.toLowerCase()}`),
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  function handleRemove() {
    if (!removing || !removing.memberId) return;

    removeMember.mutate(removing.memberId, {
      onSuccess: () => {
        toast.success(`${removing.fullName} removed`);
        setRemoving(null);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  function handleRevoke(member: MemberView) {
    if (!member.inviteId) return;

    revokeInvite.mutate(member.inviteId, {
      onSuccess: () => toast.success(`Invite to ${member.fullName} revoked`),
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  if (members.isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (members.isError) {
    return (
      <div className="rounded-lg border bg-destructive-tint px-4 py-3 text-sm text-destructive-strong">
        {getErrorMessage(members.error)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {canManage && (
        <div className="flex justify-end">
          <Button onClick={() => setInviteOpen(true)}>Invite people</Button>
        </div>
      )}

      {members.data?.length === 0 && (
        <EmptyState
          title="No members yet"
          description="Invite the people helping you plan this event."
          action={
            canManage ? (
              <Button onClick={() => setInviteOpen(true)}>Invite people</Button>
            ) : undefined
          }
        />
      )}

      <div className="space-y-2">
        {members.data?.map((member) => (
          <div
            key={member.memberId ?? member.inviteId}
            className={cn(
              "flex flex-wrap items-center gap-3 rounded-lg border bg-card p-4",
              member.pending && "opacity-70",
            )}
          >
            <UserAvatar name={member.fullName} className="size-9 shrink-0" />

            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-medium">
                <span className="truncate">{member.fullName}</span>
                {member.isYou && (
                  <span className="shrink-0 rounded-full bg-muted px-1.5 text-xs font-normal text-muted-foreground">
                    You
                  </span>
                )}
                {member.pending && (
                  <span className="shrink-0 rounded-full bg-warning-tint px-1.5 text-xs font-normal text-warning-strong">
                    Pending
                  </span>
                )}
              </p>
              {canManage && (
                <p className="truncate text-xs text-muted-foreground">{member.email}</p>
              )}
            </div>

            {!member.pending && (
              <p className="hidden text-xs text-muted-foreground sm:block">
                Joined {formatDate(member.joinedAt!)}
              </p>
            )}

            {canManage && !member.pending && member.role !== "OWNER" ? (
              <Select
                value={member.role}
                onValueChange={(role) => handleRoleChange(member, role as EventRole)}
              >
                <SelectTrigger
                  aria-label={`Change role for ${member.fullName}`}
                  className="h-8 w-[140px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNER">Planner</SelectItem>
                  <SelectItem value="CONTRIBUTOR">Contributor</SelectItem>
                  <SelectItem value="CLIENT">Client</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <RoleBadge role={member.role} />
            )}

            {canManage && (member.pending || member.role !== "OWNER") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label={`Actions for ${member.fullName}`}
                    className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {member.pending ? (
                    <DropdownMenuItem
                      onClick={() => handleRevoke(member)}
                      className="text-destructive-strong"
                    >
                      Revoke invite
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => setRemoving(member)}
                      className="text-destructive-strong"
                    >
                      Remove from event
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-5">
        <h2 className="text-[15px] font-semibold">What each role can do</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="sm:flex sm:gap-4">
            <dt className="w-28 shrink-0 font-medium">Owner</dt>
            <dd className="text-foreground-soft">
              Everything, including deleting the event. One per event.
            </dd>
          </div>
          <div className="sm:flex sm:gap-4">
            <dt className="w-28 shrink-0 font-medium">Planner</dt>
            <dd className="text-foreground-soft">
              Everything except deleting the event or changing who owns it.
            </dd>
          </div>
          <div className="sm:flex sm:gap-4">
            <dt className="w-28 shrink-0 font-medium">Contributor</dt>
            <dd className="text-foreground-soft">
              Sees tasks and money coming in. Can only edit tasks assigned to them.
              Can't see the budget.
            </dd>
          </div>
          <div className="sm:flex sm:gap-4">
            <dt className="w-28 shrink-0 font-medium">Client</dt>
            <dd className="text-foreground-soft">
              Read-only. Sees progress and the budget total, nothing else.
            </dd>
          </div>
        </dl>
      </div>

      <InviteDialog
        eventId={eventId}
        eventName={event?.name ?? "this event"}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />

      <AlertDialog open={Boolean(removing)} onOpenChange={(open) => !open && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {removing?.fullName}?</AlertDialogTitle>
            <AlertDialogDescription>
              They'll lose access to this event immediately. Tasks assigned to them stay,
              but become unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}