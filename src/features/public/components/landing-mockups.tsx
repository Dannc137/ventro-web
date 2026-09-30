import { ArrowRight, Check, Clock, Copy, Pin } from "lucide-react";
import { cn } from "@/lib/utils";

/** Fake browser chrome so the app screenshot reads as a product. */
export function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-[0_24px_60px_-20px_rgba(23,27,38,0.25)]">
      <div className="flex items-center gap-2 border-b bg-muted px-4 py-3">
        <span className="size-2.5 rounded-full bg-border-strong" />
        <span className="size-2.5 rounded-full bg-border-strong" />
        <span className="size-2.5 rounded-full bg-border-strong" />
        <span className="mx-auto rounded-md bg-card px-4 py-1 text-xs text-muted-foreground">
          app.ventro.dev
        </span>
      </div>
      {children}
    </div>
  );
}

export function DashboardMockup() {
  const stats = [
    { label: "Schedule", value: "68%", caption: "34 of 50 tasks done", bar: 68, tone: "bg-success", note: "4 days behind pace", noteTone: "text-warning-strong" },
    { label: "Budget", value: "₦2,140,000", caption: "of ₦3,000,000 planned", bar: 71, tone: "bg-primary", note: "₦460,000 unpaid", noteTone: "text-warning-strong" },
    { label: "Money in", value: "₦1,350,000", caption: "of ₦3,000,000 needed", bar: 45, tone: "bg-destructive", note: "₦1,650,000 to raise", noteTone: "text-destructive-strong" },
  ];

  const tasks = [
    { title: "Send invitations", who: "Ada O.", due: "Overdue by 2 days", dot: "bg-destructive", pill: "bg-destructive-tint text-destructive-strong" },
    { title: "Confirm caterer headcount", who: "Tunde B.", due: "Today", dot: "bg-warning", pill: "bg-warning-tint text-warning-strong" },
    { title: "Finalise seating chart", who: "Chidi N.", due: "12 Mar", dot: "bg-success", pill: "bg-muted text-muted-foreground" },
  ];

  return (
    <div className="flex text-left">
      <aside className="hidden w-48 shrink-0 border-r p-4 sm:block">
        <p className="text-[10px] font-semibold tracking-[0.04em] text-muted-foreground uppercase">
          My events
        </p>
        <div className="mt-3 space-y-1">
          {[
            { name: "Eze-Okafor Wedding", date: "5 Apr 2026", active: true, dot: "bg-success" },
            { name: "TechConnect 2026", date: "22 Jun 2026", active: false, dot: "bg-warning" },
            { name: "Youth Summit", date: "14 Mar 2026", active: false, dot: "bg-destructive" },
          ].map((event) => (
            <div
              key={event.name}
              className={cn(
                "flex items-start gap-2 rounded-md px-2 py-1.5",
                event.active && "bg-primary-tint",
              )}
            >
              <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", event.dot)} />
              <span className="min-w-0">
                <span
                  className={cn(
                    "block truncate text-xs font-medium",
                    event.active && "text-primary-strong",
                  )}
                >
                  {event.name}
                </span>
                <span className="block text-[10px] text-muted-foreground">
                  {event.date}
                </span>
              </span>
            </div>
          ))}
        </div>
      </aside>

      <div className="min-w-0 flex-1 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-semibold tracking-tight">Eze-Okafor Wedding</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              5 April 2026 · Civic Centre, Lagos
            </p>
          </div>
          <p className="shrink-0 text-sm font-semibold tabular-nums">23 days out</p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border p-3">
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              <p className="mt-0.5 text-lg leading-tight font-semibold tabular-nums">
                {stat.value}
              </p>
              <p className="text-[10px] text-muted-foreground tabular-nums">
                {stat.caption}
              </p>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", stat.tone)}
                  style={{ width: `${stat.bar}%` }}
                />
              </div>
              <p className={cn("mt-1.5 text-[10px] tabular-nums", stat.noteTone)}>
                {stat.note}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-lg border p-4">
          <p className="text-xs font-semibold">Needs attention</p>
          <div className="mt-2 rounded-md bg-destructive-tint px-3 py-2 text-[11px] text-destructive-strong">
            Invitations are 4 days late — blocking catering headcount and the seating chart
          </div>
          <ul className="mt-1 divide-y">
            {tasks.map((task) => (
              <li key={task.title} className="flex items-center gap-2 py-2">
                <span className={cn("size-1.5 shrink-0 rounded-full", task.dot)} />
                <span className="min-w-0 flex-1 truncate text-xs">{task.title}</span>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {task.who}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums",
                    task.pill,
                  )}
                >
                  {task.due}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function RescheduleMockup() {
  const moves = [
    { title: "Send invitations", from: "18 Feb", to: "3 Mar" },
    { title: "Confirm caterer", from: "25 Feb", to: "10 Mar" },
    { title: "Venue deposit", from: "1 Mar", to: "15 Mar" },
  ];

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <p className="text-[13px] font-semibold">Event date changed to 5 April 2026</p>

      <div className="mt-3 flex items-center gap-2 rounded-md bg-primary-tint px-3 py-2.5 text-xs font-medium text-primary-strong">
        <Clock className="size-3.5 shrink-0" />
        47 tasks rescheduled
      </div>

      <ul className="mt-2 divide-y">
        {moves.map((move) => (
          <li key={move.title} className="flex items-center justify-between gap-3 py-2.5">
            <span className="min-w-0 truncate text-sm">{move.title}</span>
            <span className="flex shrink-0 items-center gap-2 text-xs tabular-nums">
              <span className="text-muted-foreground line-through">{move.from}</span>
              <ArrowRight className="size-3 text-muted-foreground" />
              <span className="font-medium text-primary">{move.to}</span>
            </span>
          </li>
        ))}
        <li className="flex items-center justify-between gap-3 py-2.5">
          <span className="min-w-0 truncate text-sm">Rehearsal dinner</span>
          <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
            <Pin className="size-3" />
            Fixed · stays 4 Apr
          </span>
        </li>
      </ul>
    </div>
  );
}

export function ContributionsMockup() {
  const rows = [
    { name: "Ada Okafor", amount: "₦500,000", status: "settled" },
    { name: "Tunde Bakare", amount: "₦200,000", status: "partial" },
    { name: "Chidi Nwosu", amount: "₦250,000", status: "partial" },
    { name: "Yusuf Lawal", amount: "₦0", status: "unpaid" },
  ];

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <dl className="grid grid-cols-3 gap-3">
        <div>
          <dt className="text-[11px] text-muted-foreground">Promised</dt>
          <dd className="mt-0.5 text-[15px] font-semibold tabular-nums">₦2,100,000</dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground">Received</dt>
          <dd className="mt-0.5 text-[15px] font-semibold text-success-strong tabular-nums">
            ₦1,350,000
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground">Not yet sent</dt>
          <dd className="mt-0.5 text-[15px] font-semibold text-warning-strong tabular-nums">
            ₦750,000
          </dd>
        </div>
      </dl>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full w-[64%] rounded-full bg-success" />
      </div>

      <ul className="mt-4 divide-y">
        {rows.map((row) => (
          <li key={row.name} className="flex items-center gap-3 py-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-tint text-[10px] font-semibold text-primary-strong">
              {row.name.split(" ").map((part) => part[0]).join("")}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm">{row.name}</span>
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {row.amount}
            </span>
            {row.status === "settled" ? (
              <Check className="size-4 shrink-0 text-success-strong" />
            ) : (
              <span
                className={cn(
                  "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                  row.status === "partial"
                    ? "bg-warning-tint text-warning-strong"
                    : "bg-destructive-tint text-destructive-strong",
                )}
              >
                {row.status === "partial" ? "Partial" : "Unpaid"}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ClientViewMockup() {
  const bands = [
    { label: "Planning", percent: 68 },
    { label: "Bookings", percent: 71 },
    { label: "Payments", percent: 45 },
  ];

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="rounded-lg border">
        <div className="border-b px-5 py-6 text-center">
          <p className="text-sm font-semibold">Eze-Okafor Wedding</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            5 April 2026 · Civic Centre, Lagos
          </p>
          <p className="mt-4 text-4xl leading-none font-semibold text-primary tabular-nums">
            23
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">days to go</p>
        </div>

        <div className="space-y-2.5 p-4">
          {bands.map((band) => (
            <div key={band.label} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-[11px] text-muted-foreground">
                {band.label}
              </span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: `${band.percent}%` }}
                />
              </span>
              <span className="w-8 shrink-0 text-right text-[11px] text-muted-foreground tabular-nums">
                {band.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-md bg-primary-tint px-3 py-2.5">
        <span className="min-w-0 truncate text-xs text-primary-strong">
          ventro.dev/share/eze-okafor-23
        </span>
        <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-primary-strong">
          <Copy className="size-3.5" />
          Copy
        </span>
      </div>
    </div>
  );
}