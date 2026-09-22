import { Skeleton } from "@/components/ui/skeleton";

export function AppShellSkeleton() {
  return (
    <div className="flex min-h-svh bg-background" aria-busy="true" aria-label="Loading">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-card p-5 md:flex">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="mt-8 h-3 w-20" />
        <div className="mt-4 space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-48" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
        <Skeleton className="mt-6 h-72 rounded-lg" />
      </main>
    </div>
  );
}