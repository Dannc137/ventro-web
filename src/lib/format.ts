const DAY_MS = 24 * 60 * 60 * 1000;

/** "12 Mar" for this year, "12 Mar 2027" otherwise. */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  const sameYear = date.getFullYear() === new Date().getFullYear();

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

/** "5 April 2027" — the long form, for page headers. */
export function formatLongDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Whole days from today until the date. Negative means past. */
export function daysUntil(isoDate: string): number {
  const target = new Date(isoDate);
  const today = new Date();

  const targetDay = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const todayDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  return Math.round((targetDay - todayDay) / DAY_MS);
}

/** "Today", "Tomorrow", "In 23 days", "3 days ago". */
export function formatCountdown(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 0) return `In ${days} days`;
  return `${Math.abs(days)} days ago`;
}

/** ₦2,500,000 — no decimals, which is how Naira amounts are read. */
export function formatMoney(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}