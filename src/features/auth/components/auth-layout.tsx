import type { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[2fr_3fr]">
      <main className="flex items-center justify-center bg-card px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">
          <p className="mb-5 text-lg font-semibold tracking-tight">Ventro</p>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
      </main>

      <aside className="hidden flex-col justify-center bg-muted px-16 lg:flex">
        <h2 className="max-w-md text-3xl font-semibold tracking-tight">
          Everything your team needs to plan, in one place.
        </h2>
        <p className="mt-3 max-w-md text-foreground-soft">
          Tasks, budgets and contributions stay in sync, so you can focus on the
          event instead of the spreadsheet.
        </p>
      </aside>
    </div>
  );
}