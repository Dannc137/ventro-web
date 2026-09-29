import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api-client";
import { useAuth } from "@/features/auth";
import { resendVerification } from "@/features/auth/api";

const COOLDOWN = 60;

export function VerifyEmailBanner() {
  const { user } = useAuth();
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  if (!user || user.emailVerified) return null;

  async function handleResend() {
    setSending(true);

    try {
      await resendVerification();
      toast.success("Verification email sent");
      setCooldown(COOLDOWN);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-warning-tint px-4 py-2.5 md:px-8">
      <p className="text-sm text-warning-strong">
        Confirm your email so we can send you reminders and let you reset your
        password.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={handleResend}
        disabled={sending || cooldown > 0}
        className="shrink-0 border-warning-strong/30 bg-transparent text-warning-strong hover:bg-warning-strong/10"
      >
        {cooldown > 0 ? `Sent — resend in ${cooldown}s` : sending ? "Sending…" : "Resend email"}
      </Button>
    </div>
  );
}