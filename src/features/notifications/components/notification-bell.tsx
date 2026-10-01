import { useState } from "react";
import { useNavigate } from "react-router";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMarkAllRead, useMarkNotificationRead, useNotifications } from "../hooks";
import type { NotificationView } from "../types";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { data } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();

  const unread = data?.unreadCount ?? 0;
  const items = data?.items ?? [];

  function handleOpen(notification: NotificationView) {
    if (!notification.read) markRead.mutate(notification.id);
    setOpen(false);
    if (notification.link) navigate(notification.link);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={unread > 0 ? `${unread} unread notifications` : "Notifications"}
          className="relative rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] leading-none font-semibold text-primary-foreground tabular-nums">
                {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
  align="end"
  sideOffset={8}
  className="w-[calc(100vw-2rem)] max-w-sm p-0 sm:w-80"
>
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <p className="text-[13px] font-semibold">Notifications</p>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs font-normal text-muted-foreground hover:bg-transparent hover:text-foreground"
              onClick={() => markAllRead.mutate()}
            >
              Mark all read
            </Button>
          )}
        </div>

        {items.length === 0 ? (
  <p className="px-4 py-8 text-center text-sm text-muted-foreground">
    Nothing yet.
  </p>
) : (
  <div className="max-h-[400px] overflow-y-auto overscroll-contain">
    <ul className="divide-y">
      {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleOpen(item)}
                    className={cn(
                      "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none",
                      !item.read && "bg-primary-tint/40",
                    )}
                  >
                    <UserAvatar
                      name={item.actorName ?? "?"}
                      className="mt-0.5 size-6 shrink-0 text-[10px]"
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] leading-snug font-medium">
                        {item.title}
                      </span>
                      {item.body && (
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {item.body}
                        </span>
                      )}
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </span>

                    {!item.read && (
                      <>
                        <span className="sr-only">Unread</span>
                        <span
                          aria-hidden="true"
                          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                        />
                      </>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}