import { cn } from "@/lib/utils";

type StatusDotProps = {
  days: number;
  className?: string;
};

export function StatusDot({ days, className }: StatusDotProps) {
  const tone =
    days < 0 ? "bg-border-strong" : days <= 7 ? "bg-warning" : "bg-success";

  return (
    <span
      aria-hidden="true"
      className={cn("size-1.5 shrink-0 rounded-full", tone, className)}
    />
  );
}