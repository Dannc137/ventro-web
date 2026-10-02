import { parseBody } from "../mentions";
import { cn } from "@/lib/utils";

export function MessageBody({
  body,
  currentUserId,
  mine,
}: {
  body: string;
  currentUserId: string | undefined;
  mine: boolean;
}) {
  return (
    <span className="whitespace-pre-wrap break-words">
      {parseBody(body).map((segment, index) =>
        segment.type === "text" ? (
          <span key={index}>{segment.value}</span>
        ) : (
          <span
            key={index}
            className={cn(
              "rounded px-1 font-medium",
              mine
                ? "bg-primary-foreground/20 text-primary-foreground"
                : segment.userId === currentUserId
                  ? "bg-warning-tint text-warning-strong"
                  : "bg-primary-tint text-primary-strong",
            )}
          >
            @{segment.name}
          </span>
        ),
      )}
    </span>
  );
}