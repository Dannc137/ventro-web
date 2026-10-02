import { Fragment, useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth";
import { useEvent } from "@/features/events/hooks";
import { useMembers } from "@/features/members/hooks";
import { MessageComposer } from "./message-composer";
import { MessageRow } from "./message-row";
import { TypingBubble } from "./typing-bubble";
import {
  useDeleteMessage,
  useEditMessage,
  useMarkChatRead,
  useMentionTargets,
  useMessages,
  useSendMessage,
  useTyping,
} from "../hooks";
import type { MessageView } from "../types";

const GROUP_WINDOW_MS = 5 * 60 * 1000;
const MAX_AVATARS = 3;

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dateSeparatorLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffDays = Math.round((startOfToday - startOfDay) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return formatDate(iso);
}

type ChatPanelProps = {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChatPanel({ eventId, open, onOpenChange }: ChatPanelProps) {
  const { data: event } = useEvent(eventId);
  const { data: members } = useMembers(eventId);
  const { user } = useAuth();

  const messages = useMessages(eventId);
  const sendMessage = useSendMessage(eventId);
  const editMessage = useEditMessage(eventId);
  const deleteMessage = useDeleteMessage(eventId);
  const markChatRead = useMarkChatRead(eventId);
  const mentionTargets = useMentionTargets(eventId);
  const { typingUsers, notifyTyping } = useTyping(eventId);

  const [replyTo, setReplyTo] = useState<MessageView | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const isLoadingOlderRef = useRef(false);
  const prevScrollHeightRef = useRef(0);
  const isFirstLoadRef = useRef(true);
  const lastMessageIdRef = useRef<string | null>(null);
  const wasOpenRef = useRef(false);

  // Pages come back newest-first, each page oldest-first internally.
  const flattened = useMemo(
    () => [...(messages.data?.pages ?? [])].reverse().flatMap((page) => page.items),
    [messages.data],
  );

  const rows = useMemo(() => {
    const result: { message: MessageView; showAuthor: boolean; dateLabel: string | null }[] = [];
    let previous: MessageView | null = null;

    for (const message of flattened) {
      const newDay = !previous || dayKey(previous.createdAt) !== dayKey(message.createdAt);
      const sameAuthor = previous?.authorId === message.authorId;
      const withinWindow =
        previous !== null &&
        Math.abs(new Date(message.createdAt).getTime() - new Date(previous.createdAt).getTime()) <=
          GROUP_WINDOW_MS;

      result.push({
        message,
        showAuthor: newDay || !sameAuthor || !withinWindow,
        dateLabel: newDay ? dateSeparatorLabel(message.createdAt) : null,
      });

      previous = message;
    }

    return result;
  }, [flattened]);

  function markReadIfVisible() {
    if (document.visibilityState === "visible") markChatRead.mutate();
  }

  // Mark as read whenever the panel is opened (and again on new messages
  // while it's open) — closed, it shouldn't count as "seen".
  useLayoutEffect(() => {
    if (eventId && open) markReadIfVisible();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, open]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    const justOpened = open && !wasOpenRef.current;
    wasOpenRef.current = open;

    if (!open || !el) return;

    if (isLoadingOlderRef.current) {
      // Keep whatever was on screen in place instead of jumping to the top.
      el.scrollTop += el.scrollHeight - prevScrollHeightRef.current;
      isLoadingOlderRef.current = false;
      return;
    }

    const last = flattened[flattened.length - 1];
    const isNewMessage = Boolean(last) && last.id !== lastMessageIdRef.current;

    if (isFirstLoadRef.current || justOpened) {
      if (flattened.length > 0) {
        el.scrollTop = el.scrollHeight;
        isFirstLoadRef.current = false;
      }
    } else if (isNewMessage) {
      el.scrollTop = el.scrollHeight;
      markReadIfVisible();
    }

    lastMessageIdRef.current = last?.id ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flattened, open]);

  // Typing bubbles render after the last real message — bring them into
  // view the same way a new message would be.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!open || !el || typingUsers.length === 0) return;

    el.scrollTop = el.scrollHeight;
  }, [typingUsers.length, open]);

  async function handleLoadEarlier() {
    const el = containerRef.current;
    prevScrollHeightRef.current = el?.scrollHeight ?? 0;
    isLoadingOlderRef.current = true;

    try {
      await messages.fetchNextPage();
    } catch (error) {
      isLoadingOlderRef.current = false;
      toast.error(getErrorMessage(error));
    }
  }

  async function handleSend(body: string) {
    try {
      await sendMessage.mutateAsync({ body, replyToId: replyTo?.id ?? null });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  function handleEdit(message: MessageView, body: string) {
    editMessage.mutate(
      { messageId: message.id, body },
      { onError: (error) => toast.error(getErrorMessage(error)) },
    );
  }

  function handleDelete(message: MessageView) {
    deleteMessage.mutate(message.id, {
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  const shownMembers = members?.slice(0, MAX_AVATARS) ?? [];

  return (
    <div
      role="complementary"
      aria-label="Event chat"
      aria-hidden={!open}
      className={cn(
        "fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l bg-card shadow-lg sm:w-[360px]",
        "transition-transform duration-200 ease-out motion-reduce:transition-none",
        open ? "translate-x-0" : "pointer-events-none translate-x-full",
      )}
    >
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <div className="min-w-0 flex-1">
          {event ? (
            <p className="truncate text-sm font-semibold">{event.name}</p>
          ) : (
            <Skeleton className="h-4 w-32" />
          )}

          <div className="mt-1 flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {shownMembers.map((member) => (
                <UserAvatar
                  key={member.memberId}
                  name={member.fullName}
                  className="size-5 border-2 border-card text-[9px]"
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {members ? `${members.length} member${members.length === 1 ? "" : "s"}` : ""}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onOpenChange(false)}
          aria-label="Collapse chat"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {messages.isLoading ? (
        <div className="space-y-3 p-4">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="ml-auto h-12 w-1/2" />
          <Skeleton className="h-12 w-3/5" />
        </div>
      ) : messages.isError ? (
        <div className="m-4 rounded-lg border bg-destructive-tint px-4 py-3 text-sm text-destructive-strong">
          {getErrorMessage(messages.error)}
        </div>
      ) : (
        <div ref={containerRef} className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
          {messages.hasNextPage && (
            <div className="flex justify-center pb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleLoadEarlier()}
                disabled={messages.isFetchingNextPage}
              >
                {messages.isFetchingNextPage ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Load earlier messages"
                )}
              </Button>
            </div>
          )}

          {flattened.length === 0 && typingUsers.length === 0 ? (
            <EmptyState
              title="No messages yet"
              description="This is where the team talks. Say something to get it started."
            />
          ) : (
            <>
              {rows.map(({ message, showAuthor, dateLabel }) => (
                <Fragment key={message.id}>
                  {dateLabel && (
                    <div className="flex justify-center py-2">
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                        {dateLabel}
                      </span>
                    </div>
                  )}
                  <MessageRow
                    message={message}
                    showAuthor={showAuthor}
                    onReply={setReplyTo}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    currentUserId={user?.id}
                  />
                </Fragment>
              ))}

              {typingUsers.map((typingUser) => (
                <TypingBubble key={typingUser.userId} userName={typingUser.userName} />
              ))}
            </>
          )}
        </div>
      )}

      {/* Chat deliberately stays open on a cancelled event — see
          ChatService.requireChatAccess on the backend — so the composer is
          never disabled for that reason. */}
      <MessageComposer
        targets={mentionTargets.data ?? []}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        onSend={handleSend}
        onTyping={notifyTyping}
      />
    </div>
  );
}
