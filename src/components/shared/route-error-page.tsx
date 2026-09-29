import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { Button } from "@/components/ui/button";
import { NotFoundPage } from "./not-found-page";
import * as Sentry from "@sentry/react";

export function RouteErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />;
  }

  console.error(error);
  Sentry.captureException(error);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold text-destructive-strong">
        Something went wrong
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        We hit an unexpected problem
      </h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Try reloading the page. If it keeps happening, let us know.
      </p>

      {import.meta.env.DEV && error instanceof Error && (
        <pre className="mt-6 max-w-xl overflow-auto rounded-md bg-muted p-4 text-left text-xs">
          {error.message}
        </pre>
      )}

      <div className="mt-6 flex gap-3">
        <Button onClick={() => window.location.reload()}>Reload page</Button>
        <Button variant="outline" asChild>
          <Link to="/">Back to Ventro</Link>
        </Button>
      </div>
    </main>
  );
}