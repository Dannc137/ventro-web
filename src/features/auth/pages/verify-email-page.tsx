import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CodeInput } from "@/components/shared/code-input";
import { FormAlert } from "@/components/shared/form-alert";
import { getErrorMessage } from "@/lib/api-client";
import { AuthLayout } from "../components/auth-layout";
import { useAuth } from "../auth-context";
import { resendCode, verifyCode } from "../api";

const COOLDOWN = 45;
const LENGTH = 6;
const empty = () => Array(LENGTH).fill("");

export function VerifyEmailPage() {
  const { user, refreshSessionNow, logout } = useAuth();
  const navigate = useNavigate();

  const [digits, setDigits] = useState<string[]>(empty);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(COOLDOWN);

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
      setDigits(empty());
    } finally {
      setChecking(false);
    }
  }

  async function handleResend() {
    setError(null);

    try {
      await resendCode();
      toast.success("New code sent");
      setCooldown(COOLDOWN);
      setDigits(empty());
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

        <CodeInput
          value={digits}
          onChange={setDigits}
          onComplete={submit}
          disabled={checking}
          autoFocus
        />

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