import { cn } from "@/lib/utils";
import type { EventRole } from "@/features/events/types.ts";

const LABELS: Record<EventRole, string> = {
  OWNER: "Owner",
  PLANNER: "Planner",
  CONTRIBUTOR: "Contributor",
  CLIENT: "Client",
};

export function RoleBadge({ role, className }: { role: EventRole; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {LABELS[role]}
    </span>
  );
}