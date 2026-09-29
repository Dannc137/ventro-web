import { cn } from "@/lib/utils";

type Tone = "primary" | "success" | "warning" | "destructive";

const FILLS: Record<Tone, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

type ProgressBarProps = {
  percent: number;
  tone?: Tone;
  className?: string;
};

export function ProgressBar({ percent, tone = "primary", className }: ProgressBarProps) {
  const value = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", FILLS[tone])}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}