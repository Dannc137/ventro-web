import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/api-client";
import { AuthLayout } from "../components/auth-layout";
import { forgotPassword } from "../api";
import { forgotPasswordSchema, type ForgotPasswordValues } from "../schemas";

const FIRST_COOLDOWN = 30;
const MAX_ATTEMPTS = 4;

export function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  async function onSubmit(values: ForgotPasswordValues) {
    setFormError(null);

    try {
      await forgotPassword({ email: values.email });
      setAttempts(1);
      setCooldown(FIRST_COOLDOWN);
      setSentTo(values.email);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  async function handleResend() {
    if (!sentTo || cooldown > 0) return;

    setFormError(null);

    try {
      await forgotPassword({ email: sentTo });
      const next = attempts + 1;
      setAttempts(next);
      setCooldown(FIRST_COOLDOWN * 2 ** (next - 1));
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

   if (sentTo) {
    const exhausted = attempts >= MAX_ATTEMPTS;

    return (
      <AuthLayout
        title="Check your email"
        subtitle={`If an account exists for ${sentTo}, a reset link is on its way. It works once and expires in an hour.`}
      >
        {formError && (
          <p
            role="alert"
            className="mb-5 rounded-md bg-destructive-tint px-3 py-2 text-sm text-destructive-strong"
          >
            {formError}
          </p>
        )}

        {exhausted ? (
          <p className="text-sm text-muted-foreground">
            Still nothing? Check your spam folder — or the address may not be the one
            on the account.
          </p>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={cooldown > 0}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend link"}
          </Button>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link
            to="/login"
            className="rounded-md font-medium text-primary transition-colors hover:text-primary-hover focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            Back to sign in
          </Link>
          <Link
            to="/register"
            className="rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            Create an account
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link to set a new one."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {formError && (
          <p
            role="alert"
            className="rounded-md bg-destructive-tint px-3 py-2 text-sm text-destructive-strong"
          >
            {formError}
          </p>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="ada@example.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive-strong">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link
          to="/login"
          className="font-medium text-primary transition-colors hover:text-primary-hover"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}