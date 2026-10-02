import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentEvent } from "@/features/events/hooks";
import { can } from "@/lib/permissions";
import { useChatUnread } from "../hooks";

type ChatLauncherProps = {
  eventId: string;
  open: boolean;
  onOpen: () => void;
};

export function ChatLauncher({ eventId, open, onOpen }: ChatLauncherProps) {
  const event = useCurrentEvent();
  const { data: unreadCount = 0 } = useChatUnread(eventId);

  if (!event || !can(event, "VIEW_CHAT") || open) return null;

  return (
    <Button
      onClick={onOpen}
      size="icon"
      aria-label={
        unreadCount > 0 ? `Open chat, ${unreadCount} unread` : "Open chat"
      }
      className="fixed right-6 bottom-6 z-40 size-12 rounded-full shadow-lg"
    >
      <MessageCircle className="size-5" />
      {unreadCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-semibold text-destructive-foreground"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Button>
  );
}
