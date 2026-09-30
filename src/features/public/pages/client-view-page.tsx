import { useParams } from "react-router";
import { Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicLayout } from "@/components/layout/public-layout";
import { ProgressBar } from "@/components/shared/progress-bar";
import { formatCountdown, formatDate, formatLongDate, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useClientView } from "../hooks";
import type { Milestone } from "../types";
import { useForceLight } from "@/hooks/use-force-light";

export function ClientViewPage() {
  useForceLight()
  const { token = "" } = useParams();
  const view = useClientView(token);

  if (view.isLoading) {
    return (
      <PublicLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </PublicLayout>
    );
  }

  if (view.isError || !view.data) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-md py-12 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            This link isn't available
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sharing may have been turned off, or the link may have changed. Ask the
            organiser for a new one.
          </p>
        </div>
      </PublicLayout>
    );
  }

  const data = view.data;

  const percentPaid =
    data.budgetCommitted > 0
      ? ((data.budgetCommitted - data.budgetRemaining) / data.budgetCommitted) * 100
      : 0;

  const pending = data.milestones.filter((m) => !m.done);
  const completed = data.milestones.filter((m) => m.done);

  return (
    <PublicLayout>
      <header>
        <p className="text-sm text-muted-foreground">
          {data.sharedByName ? `Shared by ${data.sharedByName}` : "Event update"}
        </p>
        <h1 className="mt-1 text-3xl leading-tight font-semibold tracking-tight">
          {data.eventName}
        </h1>
        <p className="mt-2 text-sm text-foreground-soft">
          {formatLongDate(data.eventDate)}
          {data.venue ? ` · ${data.venue}` : ""}
          <span className="mt-1 block font-medium text-foreground tabular-nums">
            {formatCountdown(data.daysUntilEvent)}
          </span>
        </p>
      </header>

      <section className="mt-8 rounded-lg border bg-card p-6">
        <h2 className="text-[15px] font-semibold">Where things stand</h2>
        <div className="mt-5 space-y-5">
          {data.progress.map((band) => (
            <div key={band.label}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium">{band.label}</span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {band.percent}%
                </span>
              </div>
              <ProgressBar
                percent={band.percent}
                tone={band.percent >= 80 ? "success" : "primary"}
                className="mt-2"
              />
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[3fr_2fr]">
        <section className="rounded-lg border bg-card p-6">
          <h2 className="text-[15px] font-semibold">Coming up</h2>

          {data.upNext.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Nothing scheduled right now.
            </p>
          ) : (
            <ul className="mt-4 divide-y">
              {data.upNext.map((item, index) => (
                <li
                  key={`${item.title}-${index}`}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <span className="min-w-0 truncate text-sm">{item.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {formatDate(item.dueDate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border bg-card p-6">
          <h2 className="text-[15px] font-semibold">Budget</h2>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Approved</dt>
              <dd className="font-medium tabular-nums">
                {formatMoney(data.budgetApproved)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Committed</dt>
              <dd className="font-medium tabular-nums">
                {formatMoney(data.budgetCommitted)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t pt-3">
              <dt className="text-muted-foreground">Remaining</dt>
              <dd
                className={cn(
                  "font-medium tabular-nums",
                  data.budgetRemaining < 0 && "text-destructive-strong",
                )}
              >
                {formatMoney(data.budgetRemaining)}
              </dd>
            </div>
          </dl>

          <ProgressBar
            percent={percentPaid}
            tone={data.budgetRemaining < 0 ? "destructive" : "primary"}
            className="mt-5"
          />
        </section>
      </div>

      {data.milestones.length > 0 && (
        <section className="mt-6 rounded-lg border bg-card p-6">
          <h2 className="text-[15px] font-semibold">Milestones</h2>

          <ul className="mt-4 space-y-3">
            {pending.map((milestone, index) => (
              <MilestoneRow key={`pending-${index}`} milestone={milestone} />
            ))}

            {pending.length > 0 && completed.length > 0 && (
              <li className="pt-2">
                <p className="border-t pt-3 text-xs text-muted-foreground">Done</p>
              </li>
            )}

            {completed.map((milestone, index) => (
              <MilestoneRow key={`done-${index}`} milestone={milestone} />
            ))}
          </ul>
        </section>
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground">
        This is a read-only summary. Ask the organiser for anything else.
      </p>
    </PublicLayout>
  );
}

function MilestoneRow({ milestone }: { milestone: Milestone }) {
  return (
    <li className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full",
          milestone.done ? "bg-success-tint" : "border border-border-strong",
        )}
      >
        {milestone.done && <Check className="size-3 text-success-strong" />}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm",
          milestone.done && "text-muted-foreground",
        )}
      >
        {milestone.title}
      </span>
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
        {formatDate(milestone.dueDate)}
      </span>
    </li>
  );
}