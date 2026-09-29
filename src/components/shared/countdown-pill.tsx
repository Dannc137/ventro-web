import { cn } from "@/lib/utils";
import { formatCountdown } from "@/lib/format";

type CountdownPillProps = {
  days: number;
  className?: string;
};

export function CountdownPill({ days, className }: CountdownPillProps) {
  const tone =
    days < 0
      ? "bg-muted text-muted-foreground"
      : days <= 7
        ? "bg-warning-tint text-warning-strong"
        : "bg-primary-tint text-primary-strong";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone,
        className,
      )}
    >
      {days < 0 ? "Past" : formatCountdown(days)}
    </span>
  );
}