import { Link, NavLink } from "react-router";
import { Menu } from "lucide-react";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { ThemeToggle } from "../shared/theme-toggle"; 
import { useCurrentEvent } from "@/features/events/hooks";
import { can, type Permission } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const TABS: {
  to: string;
  label: string;
  permission: Permission;
  end: boolean;
}[] = [
   { to: "", label: "Dashboard", permission: "VIEW_EVENT", end: true },
  { to: "tasks", label: "Tasks", permission: "VIEW_TASKS", end: false },
  { to: "budget", label: "Budget", permission: "VIEW_BUDGET_DETAIL", end: false },
  { to: "money", label: "Money", permission: "VIEW_MONEY", end: false },
  { to: "members", label: "Members", permission: "VIEW_EVENT", end: false },
  { to: "activity", label: "Activity", permission: "VIEW_EVENT", end: false },
  { to: "settings", label: "Settings", permission: "VIEW_EVENT", end: false },
];

export function TopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const event = useCurrentEvent();
  const tabs = event
    ? TABS.filter((tab) => can(event, tab.permission))
    : [];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4 md:px-8">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open menu"
        className="-ml-2 shrink-0 rounded-md p-2 text-muted-foreground hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none md:hidden"
      >
        <Menu className="size-5" />
      </button>

      {tabs.length > 0 ? (
        <nav className="scrollbar-none -mb-px flex h-14 min-w-0 flex-1 items-center gap-5 overflow-x-auto overflow-y-hidden">
          {tabs.map((tab) => (
            <NavLink
              key={tab.label}
              to={tab.to ? `/events/${event!.id}/${tab.to}` : `/events/${event!.id}`}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  "flex h-14 shrink-0 items-center border-b-2 text-sm font-medium transition-colors",
                  "focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      ) : (
        <span className="flex-1 text-sm font-medium md:hidden">Ventro</span>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-1">
        {event && (
          <Link
            to="/events"
            className="hidden rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none sm:block"
          >
            All events
          </Link>
        )}
        <ThemeToggle />
        <NotificationBell />
      </div>
    </header>
  );
}