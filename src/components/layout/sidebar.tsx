import { NavLink } from "react-router";
import { LogOut, Plus } from "lucide-react";
import { StatusDot } from "@/components/shared/status-dot";
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth";
import { useEvents } from "@/features/events/hooks";

type SidebarProps = {
    onCreateEvent: () => void;
    onNavigate?: () => void;
};

export function Sidebar({ onCreateEvent, onNavigate }: SidebarProps) {
    const { data: allEvents, isLoading } = useEvents();
    const { user, logout } = useAuth();

    const events = (allEvents ?? []).filter(
        (event) =>
            event.status !== "ARCHIVED" && event.daysUntil >= -30,
    );

    return (
        <div className="flex h-full flex-col bg-card">
            <div className="px-5 py-5">
                <span className="text-lg font-semibold tracking-tight">Ventro</span>
            </div>

            <nav className="flex-1 overflow-y-auto px-3">
                <p className="px-2 pb-2 text-[11px] font-semibold tracking-[0.04em] text-muted-foreground uppercase">
                    My events
                </p>

                {isLoading && (
                    <p className="px-2 py-2 text-sm text-muted-foreground">Loading…</p>
                )}

                {events?.length === 0 && (
                    <p className="px-2 py-2 text-sm text-muted-foreground">No events yet.</p>
                )}

                <ul className="space-y-0.5">
                    {events?.map((event) => (
                        <li key={event.id}>
                            <NavLink
                                to={`/events/${event.id}`}
                                onClick={onNavigate}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-start gap-2.5 rounded-md px-2.5 py-2 transition-colors",
                                        "focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none",
                                        isActive
                                            ? "bg-primary-tint text-primary-strong"
                                            : "hover:bg-muted",
                                    )
                                }
                            >
                                <StatusDot days={event.daysUntil} className="mt-1.5" />
                                <span className="min-w-0">
                                    <span className={cn(
                                        "block truncate text-sm leading-tight font-medium",
                                        event.status === "CANCELLED" && "text-muted-foreground line-through",
                                    )}>
                                        {event.name}
                                    </span>
                                    <span className="mt-0.5 block text-xs leading-tight text-muted-foreground">
                                        {formatDate(event.eventDate)}
                                    </span>
                                </span>
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <button
                    type="button"
                    onClick={onCreateEvent}
                    className="mt-2 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
                >
                    <Plus className="size-4" />
                    New event
                </button>
                <NavLink
                    to="/events"
                    end
                    onClick={onNavigate}
                    className={({ isActive }) =>
                        cn(
                            "mt-1 block rounded-md px-2.5 py-2 text-sm transition-colors",
                            "focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none",
                            isActive
                                ? "bg-primary-tint font-medium text-primary-strong"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )
                    }
                >
                    All events
                </NavLink>
            </nav>

            <div className="mt-auto flex items-center gap-2.5 border-t px-3 py-3">
                <NavLink
                    to="/account"
                    onClick={onNavigate}
                    className={({ isActive }) =>
                        cn(
                            "flex min-w-0 flex-1 items-center gap-2.5 rounded-md px-1 py-1 transition-colors",
                            "focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none",
                            isActive ? "bg-primary-tint" : "hover:bg-muted",
                        )
                    }
                >
                    <UserAvatar name={user?.fullName ?? ""} />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {user?.fullName}
                    </span>
                </NavLink>
                <button type="button" onClick={logout} aria-label="Log out" className="...">
                    <LogOut className="size-4" />
                </button>
            </div>
        </div>
    );
}