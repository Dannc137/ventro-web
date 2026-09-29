import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
// import { ContributionsMockup } from "@/features/public/components/landing-mockups";

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
          <Link
            to="/"
            className="group inline-flex items-center gap-2 rounded-md text-lg font-semibold tracking-tight transition-colors hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            <ArrowLeft className="size-4 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
            Ventro
          </Link>

          <h1 className="mt-10 text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>

      <aside className="hidden flex-col justify-center bg-muted px-16 lg:flex">
  <h2 className="max-w-md text-3xl font-semibold tracking-tight">
    Everything your team needs to plan, in one place.
  </h2>
  <p className="mt-3 max-w-md text-foreground-soft">
    Tasks, budgets and contributions stay in sync, so you can focus on the event
    instead of the spreadsheet.
  </p>
</aside>
    </div>
  );
}