import { Skeleton } from "@/components/ui/skeleton";

export function AuthPageSkeleton() {
  return (
    <div className="grid min-h-svh lg:grid-cols-[2fr_3fr]" aria-busy="true" aria-label="Loading">
      <div className="flex items-center justify-center bg-card px-4 py-12">
        <div className="w-full max-w-sm">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="mt-10 h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
          <div className="mt-8 space-y-5">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block" />
    </div>
  );
}