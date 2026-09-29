import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FormAlertProps = {
  title: string;
  children?: ReactNode;
  tone?: "error" | "warning";
};

export function FormAlert({ title, children, tone = "error" }: FormAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "border-l-2 pl-3",
        tone === "warning" ? "border-warning" : "border-destructive",
      )}
    >
      <p
        className={cn(
          "text-sm font-medium",
          tone === "warning" ? "text-warning-strong" : "text-destructive-strong",
        )}
      >
        {title}
      </p>
      {children && (
        <p className="mt-0.5 text-sm text-muted-foreground">{children}</p>
      )}
    </div>
  );
}