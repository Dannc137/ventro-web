import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FormAlert } from "@/components/shared/form-alert";
import { PublicLayout } from "@/components/layout/public-layout";
import { getErrorMessage } from "@/lib/api-client";
import { useAuth } from "../auth-context";
import { verifyEmail } from "../api";

type State = "verifying" | "done" | "failed";

export function VerifyEmailPage() {
  const { token = "" } = useParams();
  const { status } = useAuth();

  const [state, setState] = useState<State>("verifying");
  const [error, setError] = useState<string | null>(null);
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current || !token) return;
    attempted.current = true;

    verifyEmail(token)
      .then(() => setState("done"))
      .catch((err) => {
        setError(getErrorMessage(err));
        setState("failed");
      });
  }, [token]);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-md py-8">
        {state === "verifying" && (
          <>
            <Skeleton className="h-8 w-56" />
            <Skeleton className="mt-3 h-4 w-72" />
          </>
        )}

        {state === "done" && (
          <>
            <span className="flex size-10 items-center justify-center rounded-full bg-success-tint">
              <Check className="size-5 text-success-strong" />
            </span>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight">
              Email confirmed
            </h1>
            <p className="mt-2 text-sm text-foreground-soft">
              You'll get reminders about your events, and you can reset your password
              if you ever need to.
            </p>
            <Button asChild className="mt-6">
              <Link to={status === "authenticated" ? "/events" : "/login"}>
                {status === "authenticated" ? "Back to Ventro" : "Sign in"}
              </Link>
            </Button>
          </>
        )}

        {state === "failed" && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">
              This link didn't work
            </h1>
            <div className="mt-4">
              <FormAlert title={error ?? "The link isn't valid."}>
                {status === "authenticated"
                  ? "Ask for a new one from your account."
                  : "Sign in and request a new link from the banner at the top."}
              </FormAlert>
            </div>
            <Button asChild variant="outline" className="mt-6">
              <Link to={status === "authenticated" ? "/events" : "/login"}>
                {status === "authenticated" ? "Back to Ventro" : "Sign in"}
              </Link>
            </Button>
          </>
        )}
      </div>
    </PublicLayout>
  );
}