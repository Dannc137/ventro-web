import { useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicLayout } from "@/components/layout/public-layout";
import { getErrorMessage } from "@/lib/api-client";
import { daysUntil, formatCountdown, formatLongDate } from "@/lib/format";
import { useAuth } from "@/features/auth";
import { useInvitePreview, useJoinWithInvite } from "../hooks";

export function InvitePage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const { status } = useAuth();

  const preview = useInvitePreview(token);
  const join = useJoinWithInvite();

  const attempted = useRef(false);

  // Join automatically once we know the user is signed in and the invite is good.
  useEffect(() => {
    if (attempted.current) return;
    if (status !== "authenticated") return;
    if (!preview.data?.valid) return;

    attempted.current = true;

    join.mutate(token, {
      onSuccess: (result) => {
        toast.success(
          result.alreadyMember
            ? `You're already in ${result.eventName}`
            : `You've joined ${result.eventName}`,
        );
        navigate(`/events/${result.eventId}`, { replace: true });
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }, [status, preview.data, token, join, navigate]);

  if (status === "loading" || preview.isLoading) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-md space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </PublicLayout>
    );
  }

  if (preview.isError || !preview.data) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            This invite link doesn't work
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            It may have expired, been used up, or been withdrawn. Ask whoever sent it
            for a new one.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/">Go to Ventro</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const invite = preview.data;

  if (!invite.valid) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            This invite is no longer valid
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {invite.reason ?? "Ask whoever sent it for a new link."}
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/">Go to Ventro</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const isClient = invite.role === "CLIENT";

  return (
    <PublicLayout>
      <div className="mx-auto max-w-md">
        <p className="text-sm text-muted-foreground">
          {invite.invitedByName
            ? `${invite.invitedByName} invited you to help plan`
            : "You've been invited to help plan"}
        </p>

        <h1 className="mt-1 text-3xl leading-tight font-semibold tracking-tight">
          {invite.eventName}
        </h1>

        <p className="mt-3 text-sm text-foreground-soft">
          {formatLongDate(invite.eventDate)}
          {invite.venue ? ` · ${invite.venue}` : ""}
          <span className="mt-1 block text-muted-foreground tabular-nums">
            {formatCountdown(daysUntil(invite.eventDate))}
          </span>
        </p>

        <div className="mt-8 rounded-lg border bg-card p-5">
          <p className="text-[13px] font-semibold">
            As a {isClient ? "client" : "contributor"}, you'll be able to
          </p>
          <ul className="mt-3 space-y-2 text-sm text-foreground-soft">
            {isClient ? (
              <>
                <li className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  See how the planning is going
                </li>
                <li className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  Keep an eye on the budget
                </li>
              </>
            ) : (
              <>
                <li className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  See what needs doing and when
                </li>
                <li className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  Tick off tasks assigned to you
                </li>
                <li className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  Track what you've contributed and what's left
                </li>
              </>
            )}
          </ul>
        </div>

        {status === "authenticated" ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {join.isPending ? "Joining…" : "Taking you to the event…"}
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            <Button asChild size="lg" className="w-full">
              <Link to="/register" state={{ inviteToken: token }}>
                Create an account to join
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login" state={{ inviteToken: token }}>
                I already have an account
              </Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Free. Takes about a minute.
            </p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}