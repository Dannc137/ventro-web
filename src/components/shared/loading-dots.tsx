import { cn } from "@/lib/utils";

type LoadingDotsProps = {
  className?: string;
};

/** Three dots animating in sequence — an inline stand-in for a bare "…". */
export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <span aria-hidden="true" className={cn("inline-flex items-center gap-0.5", className)}>
      <span className="loading-dot size-1 rounded-full bg-current" />
      <span className="loading-dot size-1 rounded-full bg-current" />
      <span className="loading-dot size-1 rounded-full bg-current" />
    </span>
  );
}
