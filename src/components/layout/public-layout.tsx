import type { ReactNode } from "react";
import { Link } from "react-router";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4 md:px-8">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            Ventro
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 md:px-8">
        {children}
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-muted-foreground md:px-8">
          Ventro — plan events without the group chat chaos
        </div>
      </footer>
    </div>
  );
}