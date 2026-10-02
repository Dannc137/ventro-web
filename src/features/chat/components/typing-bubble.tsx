import { UserAvatar } from "@/components/shared/user-avatar";

type TypingBubbleProps = {
  userName: string;
};

/** A received-message-shaped stand-in — as if this person were mid-send. */
export function TypingBubble({ userName }: TypingBubbleProps) {
  return (
    <div className="flex items-start gap-1.5" aria-label={`${userName} is typing`}>
      <UserAvatar name={userName} className="mt-0.5" />

      <div className="min-w-0">
        <p className="mb-0.5 px-1 text-xs font-medium text-muted-foreground">{userName}</p>

        <div
          className="flex w-14 items-center justify-center gap-1 rounded-lg bg-muted px-3 py-2"
          aria-hidden="true"
        >
          <span className="typing-dot size-1.5 rounded-full bg-muted-foreground/50" />
          <span className="typing-dot size-1.5 rounded-full bg-muted-foreground/50" />
          <span className="typing-dot size-1.5 rounded-full bg-muted-foreground/50" />
        </div>
      </div>
    </div>
  );
}
