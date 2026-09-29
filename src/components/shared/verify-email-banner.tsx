import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api-client";
import { useAuth } from "@/features/auth";
import { resendVerification } from "@/features/auth/api";

const COOLDOWN = 60;
const GRACE_DAYS = 3;

export function VerifyEmailBanner() {
    const [cooldown, setCooldown] = useState(0);
    const [sending, setSending] = useState(false);
    const { user, refreshUser } = useAuth();
    const [now] = useState(() => Date.now());


    useEffect(() => {
        void refreshUser();
    }, []);

    useEffect(() => {
        if (cooldown <= 0) return;

        const timer = setInterval(() => {
            setCooldown((seconds) => Math.max(0, seconds - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldown]);

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

    if (!user || user.emailVerified) return null;


    const ageInDays =
        (now - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);

    if (ageInDays < GRACE_DAYS) return null;

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted px-4 py-2.5 md:px-8">
            <p className="text-sm text-foreground-soft">
                Confirm your email so you can reset your password if you ever need to.
            </p>
            <Button
                variant="outline"
                size="sm"
                onClick={handleResend}
                disabled={sending || cooldown > 0}
                className="shrink-0"
            >
                {cooldown > 0
                    ? `Sent — resend in ${cooldown}s`
                    : sending
                        ? "Sending…"
                        : "Resend email"}
            </Button>
        </div>
    );
}