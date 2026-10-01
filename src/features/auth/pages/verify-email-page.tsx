import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/shared/form-alert";
import { getErrorMessage } from "@/lib/api-client";
import { AuthLayout } from "../components/auth-layout";
import { useAuth } from "../auth-context";
import { resendCode, verifyCode } from "../api";

const COOLDOWN = 45;
const LENGTH = 6;

export function VerifyEmailPage() {
  const { user, refreshSessionNow, logout } = useAuth();
  const navigate = useNavigate();

  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(COOLDOWN);

  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function submit(code: string) {
    setChecking(true);
    setError(null);

    try {
      await verifyCode(code);
      await refreshSessionNow();
      toast.success("Email confirmed");
      navigate("/events", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setDigits(Array(LENGTH).fill(""));
      inputs.current[0]?.focus();
    } finally {
      setChecking(false);
    }
  }

  function handleChange(index: number, value: string) {
    const clean = value.replace(/\D/g, "");
    if (!clean) return;

    const next = [...digits];

    // Handle a pasted code landing in one box.
    if (clean.length > 1) {
      clean.split("").slice(0, LENGTH - index).forEach((char, offset) => {
        next[index + offset] = char;
      });
      setDigits(next);

      const filled = next.filter(Boolean).length;
      if (filled === LENGTH) void submit(next.join(""));
      else inputs.current[Math.min(index + clean.length, LENGTH - 1)]?.focus();
      return;
    }

    next[index] = clean;
    setDigits(next);

    if (index < LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (next.every(Boolean)) void submit(next.join(""));
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      event.preventDefault();

      const next = [...digits];

      if (next[index]) {
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        next[index - 1] = "";
        setDigits(next);
        inputs.current[index - 1]?.focus();
      }
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  async function handleResend() {
    setError(null);

    try {
      await resendCode();
      toast.success("New code sent");
      setCooldown(COOLDOWN);
      setDigits(Array(LENGTH).fill(""));
      inputs.current[0]?.focus();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <AuthLayout
      title="Confirm your email"
      subtitle={`We sent a 6-digit code to ${user?.email ?? "your email"}.`}
    >
      <div className="space-y-5">
        {error && <FormAlert title={error} />}

        <div className="flex justify-between gap-2">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={LENGTH}
              value={digit}
              disabled={checking}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              aria-label={`Digit ${index + 1}`}
              className="h-14 w-full rounded-lg border bg-card text-center text-xl font-semibold tabular-nums transition-colors focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none disabled:opacity-60"
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {checking ? "Checking…" : "Didn't get it? Check your spam folder."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={cooldown > 0 || checking}
            className="shrink-0"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend"}
          </Button>
        </div>

        <p className="border-t pt-5 text-center text-sm text-muted-foreground">
          Wrong email address?{" "}
          <button
            type="button"
            onClick={() => void logout()}
            className="font-medium text-primary hover:text-primary-hover"
          >
            Start over
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}