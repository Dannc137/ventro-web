import { useEffect, useRef, useState } from "react";
import { CornerUpLeft, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn } from "@/lib/utils";
import { activeMention, filterTargets, toDisplayText } from "../mentions";
import type { MentionTarget, MessageView } from "../types";

type InsertedMention = { name: string; userId: string };

/**
 * Display text has plain "@Name" mentions. Walk it left to right, swapping
 * each tracked mention's next remaining occurrence for the markup the
 * backend expects, so the same name mentioned twice maps to both spots
 * in order rather than both collapsing onto the first occurrence.
 */
function toMarkup(text: string, mentions: InsertedMention[]): string {
  let result = "";
  let cursor = 0;

  for (const mention of mentions) {
    const needle = `@${mention.name}`;
    const index = text.indexOf(needle, cursor);
    if (index === -1) continue;

    result += text.slice(cursor, index) + `@[${mention.name}](${mention.userId})`;
    cursor = index + needle.length;
  }

  return result + text.slice(cursor);
}

type MessageComposerProps = {
  targets: MentionTarget[];
  replyTo: MessageView | null;
  onCancelReply: () => void;
  onSend: (body: string) => Promise<void>;
  onTyping?: () => void;
  disabled?: boolean;
};

export function MessageComposer({
  targets,
  replyTo,
  onCancelReply,
  onSend,
  onTyping,
  disabled,
}: MessageComposerProps) {
  const [text, setText] = useState("");
  const [mentions, setMentions] = useState<InsertedMention[]>([]);
  const [sending, setSending] = useState(false);
  const [mention, setMention] = useState<{ query: string; start: number } | null>(null);
  const [highlighted, setHighlighted] = useState(0);

  const textarea = useRef<HTMLTextAreaElement>(null);

  const matches = mention ? filterTargets(targets, mention.query) : [];
  const picking = mention !== null && matches.length > 0;

  // Grow with the content, up to a point.
  useEffect(() => {
    const el = textarea.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text]);

  useEffect(() => {
    if (replyTo) textarea.current?.focus();
  }, [replyTo]);

  function handleInput(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = event.target.value;
    setText(next);
    onTyping?.();

    // Deleting part of a name drops it from the tracked list too.
    setMentions((prev) => prev.filter((m) => next.includes(`@${m.name}`)));

    const found = activeMention(next, event.target.selectionStart ?? next.length);
    setMention(found);
    setHighlighted(0);
  }

  function choose(target: MentionTarget) {
    const el = textarea.current;
    if (!el || !mention) return;

    const cursor = el.selectionStart ?? text.length;
    const insertion = `@${target.fullName} `;
    const next = text.slice(0, mention.start) + insertion + text.slice(cursor);

    setText(next);
    setMentions((prev) => [...prev, { name: target.fullName, userId: target.userId }]);
    setMention(null);

    const nextCursor = mention.start + insertion.length;

    // Put the caret after the inserted mention, once React has re-rendered.
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(nextCursor, nextCursor);
    });
  }

  async function send() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);

    try {
      await onSend(toMarkup(trimmed, mentions));
      setText("");
      setMentions([]);
      setMention(null);
      onCancelReply();
    } finally {
      setSending(false);
      textarea.current?.focus();
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (picking) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlighted((i) => (i + 1) % matches.length);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlighted((i) => (i - 1 + matches.length) % matches.length);
        return;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        choose(matches[highlighted]);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setMention(null);
        return;
      }
    }

    // Enter sends, Shift+Enter makes a new line.
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send();
    }

    if (event.key === "Escape" && replyTo) {
      onCancelReply();
    }
  }

  return (
    <div className="relative border-t bg-card">
      {picking && (
        <ul
          role="listbox"
          className="absolute bottom-full left-3 mb-2 w-64 overflow-hidden rounded-lg border bg-popover shadow-lg"
        >
          {matches.map((target, index) => (
            <li key={target.userId}>
              <button
                type="button"
                role="option"
                aria-selected={index === highlighted}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(target);
                }}
                onMouseEnter={() => setHighlighted(index)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors",
                  index === highlighted ? "bg-muted" : "hover:bg-muted",
                )}
              >
                <UserAvatar
                  name={target.fullName}
                  className="size-6 shrink-0 text-[10px]"
                />
                <span className="truncate">{target.fullName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {replyTo && (
        <div className="flex items-start gap-2 border-b px-4 py-2">
          <CornerUpLeft className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-primary">
              {replyTo.authorName ?? "Former member"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {replyTo.body ? toDisplayText(replyTo.body) : "Deleted message"}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            aria-label="Cancel reply"
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 px-4 py-3">
        <textarea
          ref={textarea}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled || sending}
          rows={1}
          placeholder="Write a message"
          aria-label="Message"
          className="min-h-9 flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm transition-colors focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none disabled:opacity-60"
        />
        <Button
          size="icon"
          onClick={() => void send()}
          disabled={!text.trim() || sending || disabled}
          aria-label="Send message"
          className="size-9 shrink-0"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}