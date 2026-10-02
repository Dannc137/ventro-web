import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toDisplayText } from "../mentions";
import { MessageBody } from "./message-body";
import type { MessageView } from "../types";

const EDIT_WINDOW_MS = 15 * 60 * 1000;
const DELETE_WINDOW_MS = 60 * 60 * 1000;

type MessageRowProps = {
  message: MessageView;
  showAuthor: boolean;
  onReply: (message: MessageView) => void;
  onEdit: (message: MessageView, body: string) => void;
  onDelete: (message: MessageView) => void;
  currentUserId: string | undefined;
};

export function MessageRow({
  message,
  showAuthor,
  onReply,
  onEdit,
  onDelete,
  currentUserId,
}: MessageRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message.body ?? "");

  const age = Date.now() - new Date(message.createdAt).getTime();
  const canEdit = message.mine && !message.deleted && age < EDIT_WINDOW_MS;
  const canDelete = message.mine && !message.deleted && age < DELETE_WINDOW_MS;

  function startEdit() {
    setDraft(message.body ?? "");
    setIsEditing(true);
  }

  function commitEdit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== message.body) {
      onEdit(message, trimmed);
    }
    setIsEditing(false);
  }

  function handleEditKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      commitEdit();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setIsEditing(false);
    }
  }

  return (
    <div className={cn("flex", message.mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "group flex max-w-[85%] items-start gap-1.5 sm:max-w-[75%]",
          message.mine && "flex-row-reverse",
        )}
      >
        {!message.mine &&
          (showAuthor ? (
            <UserAvatar name={message.authorName ?? "?"} className="mt-0.5" />
          ) : (
            <div aria-hidden="true" className="size-7 shrink-0" />
          ))}

        <div className="min-w-0">
          {showAuthor && !message.mine && (
            <p className="mb-0.5 px-1 text-xs font-medium text-muted-foreground">
              {message.authorName ?? "Former member"}
            </p>
          )}

          <div
            className={cn(
              "relative min-w-[88px] rounded-lg px-3 pt-2 pb-5 text-sm",
              message.mine
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground",
            )}
          >
            {message.replyToId && (
              <div
                className={cn(
                  "mb-1.5 rounded-md border-l-2 px-2 py-1 text-xs",
                  message.mine
                    ? "border-primary-foreground/40 bg-primary-foreground/15"
                    : "border-primary bg-background/60",
                )}
              >
                <p
                  className={cn(
                    "font-medium",
                    message.mine ? "text-primary-foreground" : "text-primary",
                  )}
                >
                  {message.replyToAuthorName ?? "Former member"}
                </p>
                <p
                  className={cn(
                    "truncate",
                    message.mine ? "text-primary-foreground/70" : "text-muted-foreground",
                  )}
                >
                  {message.replyToBody ? toDisplayText(message.replyToBody) : "Deleted message"}
                </p>
              </div>
            )}

            {message.deleted ? (
              <p
                className={cn(
                  "pr-10 text-sm italic",
                  message.mine ? "text-primary-foreground/70" : "text-muted-foreground",
                )}
              >
                This message was deleted
              </p>
            ) : isEditing ? (
              <textarea
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleEditKeyDown}
                onBlur={commitEdit}
                rows={1}
                aria-label="Edit message"
                className={cn(
                  "w-full min-w-[160px] resize-none bg-transparent text-sm outline-none",
                  message.mine ? "placeholder:text-primary-foreground/60" : "placeholder:text-muted-foreground",
                )}
              />
            ) : (
              <p className="min-w-0 pr-10">
                <MessageBody
                  body={message.body ?? ""}
                  currentUserId={currentUserId}
                  mine={message.mine}
                />
              </p>
            )}

            {!isEditing && (
              <span
                className={cn(
                  "absolute right-2.5 bottom-1.5 text-[10px] leading-none tabular-nums whitespace-nowrap",
                  message.mine ? "text-primary-foreground/60" : "text-muted-foreground/70",
                )}
              >
                {!message.deleted && message.edited && "edited "}
                {formatTime(message.createdAt)}
              </span>
            )}
          </div>
        </div>

        {!message.deleted && !isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Message actions"
                className="mt-1 shrink-0 rounded-md p-1 text-muted-foreground opacity-100 transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none sm:opacity-0 sm:group-hover:opacity-100"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={message.mine ? "end" : "start"}>
              <DropdownMenuItem onClick={() => onReply(message)}>Reply</DropdownMenuItem>
              {canEdit && <DropdownMenuItem onClick={startEdit}>Edit</DropdownMenuItem>}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(message)}
                  className="text-destructive-strong"
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
