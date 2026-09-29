import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

type MoneyTextProps = {
  amount: number;
  className?: string;
  muted?: boolean;
};

export function MoneyText({ amount, className, muted }: MoneyTextProps) {
  return (
    <span
      className={cn(
        "tabular-nums",
        muted && amount === 0 && "text-muted-foreground",
        className,
      )}
    >
      {formatMoney(amount)}
    </span>
  );
}