import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage, isRateLimited } from "@/lib/api-client";
import { useAuth } from "../auth-context";
import { AuthLayout } from "../components/auth-layout";
import { loginSchema, type LoginValues } from "../schemas";
import { PasswordInput } from "@/components/shared/password-input";
import { FormAlert } from "@/components/shared/form-alert";
// import { useForceLight } from "@/hooks/use-force-light";

export function LoginPage() {
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const location = useLocation();
  const [rateLimited, setRateLimited] = useState(false);
  // useForceLight();


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    setRateLimited(false);

    try {
      await login(values);
    } catch (error) {
      setRateLimited(isRateLimited(error));
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account to continue." >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {formError &&
          (rateLimited ? (
            <FormAlert title="Too many sign-in attempts" tone="warning">
              Wait a few minutes, or{" "}
              <Link
                to="/forgot-password"
                className="font-medium text-primary hover:text-primary-hover"
              >
                reset your password
              </Link>
              .
            </FormAlert>
          ) : (
            <FormAlert title={formError} />
          ))}

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="ada@gmail.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive-strong">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="rounded-md text-xs text-primary transition-colors hover:text-primary-hover focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-destructive-strong">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link to="/register" state={location.state} className="font-medium text-primary hover:text-primary-hover">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}