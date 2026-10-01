import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api-client";
import { useAuth } from "@/features/auth";
import { resendVerification } from "@/features/auth/api";
import { X } from "lucide-react";

const COOLDOWN = 60;
const GRACE_DAYS = 3;

export function VerifyEmailBanner() {
    const [cooldown, setCooldown] = useState(0);
    const [sending, setSending] = useState(false);
    const { user, refreshUser } = useAuth();
    const [now] = useState(() => Date.now());

    const [dismissed, setDismissed] = useState(() => {
        try {
            return localStorage.getItem("ventro-verify-dismissed") === "true";
        } catch {
            return false;
        }
    });

    function handleDismiss() {
        setDismissed(true);
        try {
            localStorage.setItem("ventro-verify-dismissed", "true");
        } catch {
            // Private browsing; it'll just show again.
        }
    }


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

    if (!user || user.emailVerified || dismissed) return null;

    const ageInDays =
        (now - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);

    if (ageInDays < GRACE_DAYS) return null;

        return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted px-4 py-2.5 md:px-8">
            <p className="text-sm text-foreground-soft">
                Confirm your email so you can reset your password if you ever need to.
            </p>
            <div className="flex shrink-0 items-center gap-1">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResend}
                    disabled={sending || cooldown > 0}
                >
                    {cooldown > 0
                        ? `Sent — resend in ${cooldown}s`
                        : sending
                            ? "Sending…"
                            : "Resend email"}
                </Button>
                <button
                    type="button"
                    onClick={handleDismiss}
                    aria-label="Dismiss"
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
                >
                    <X className="size-4" />
                </button>
            </div>
        </div>
    );
}