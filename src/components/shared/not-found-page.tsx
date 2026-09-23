import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        This page doesn't exist
      </h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        The link may be broken, or the page may have moved.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Back to Ventro</Link>
      </Button>
    </main>
  );
}