import { ProgressBar } from "@/components/shared/progress-bar";
import { cn } from "@/lib/utils";

type Tone = "primary" | "success" | "warning" | "destructive";

const FOOTNOTE_COLOURS: Record<Tone, string> = {
    primary: "text-muted-foreground",
    success: "text-success-strong",
    warning: "text-warning-strong",
    destructive: "text-destructive-strong",
};

type StatCardProps = {
    label: string;
    value: string;
    caption: string;
    percent: number;
    tone?: Tone;
    footnote?: string;
    footnoteTone?: Tone;
};

export function StatCard({
    label,
    value,
    caption,
    percent,
    tone = "primary",
    footnote,
    footnoteTone = "primary",
}: StatCardProps) {
    return (
        <div className="rounded-lg border bg-card p-5">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl leading-tight font-semibold tabular-nums">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground tabular-nums">{caption}</p>
            <ProgressBar percent={percent} tone={tone} className="mt-3" />
            {footnote && (
                <p className={cn("mt-2 text-xs tabular-nums", FOOTNOTE_COLOURS[footnoteTone])}>
                    {footnote}
                </p>
            )}
        </div>
    );
}