import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { emptyCode } from "@/components/shared/code-input";
import { FormAlert } from "@/components/shared/form-alert";
import { PasswordInput } from "@/components/shared/password-input";
import { getErrorMessage } from "@/lib/api-client";
import { useAuth } from "../auth-context";
import { confirmEmailChange, requestEmailChange } from "../api";
import { changeEmailSchema, type ChangeEmailValues } from "../schemas";
import { CodeInput } from "@/components/shared/code-input";

const LENGTH = 6;
const empty = () => Array(LENGTH).fill("");

type ChangeEmailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChangeEmailDialog({ open, onOpenChange }: ChangeEmailDialogProps) {
  const { refreshUser } = useAuth();

  const [step, setStep] = useState<"details" | "code">("details");
  const [pending, setPending] = useState("");
  const [digits, setDigits] = useState<string[]>(empty());
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangeEmailValues>({ resolver: zodResolver(changeEmailSchema) });

  function close() {
    onOpenChange(false);
    setTimeout(() => {
      setStep("details");
      setDigits(empty());
      setError(null);
      setPending("");
      reset();
    }, 200);
  }

  async function onRequest(values: ChangeEmailValues) {
    setError(null);

    try {
      await requestEmailChange(values.newEmail, values.currentPassword);
      setPending(values.newEmail);
      setStep("code");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function onConfirm(code: string) {
    setChecking(true);
    setError(null);

    try {
      await confirmEmailChange(code);
      await refreshUser();
      toast.success("Email changed");
      close();
    } catch (err) {
      setError(getErrorMessage(err));
      setDigits(empty());
    } finally {
      setChecking(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent>
        {step === "details" ? (
          <>
            <DialogHeader>
              <DialogTitle>Change your email</DialogTitle>
              <DialogDescription>
                We'll send a code to the new address to confirm you can reach it.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onRequest)} noValidate className="space-y-4">
              {error && <FormAlert title={error} />}

              <div className="space-y-1.5">
                <Label htmlFor="newEmail">New email</Label>
                <Input
                  id="newEmail"
                  type="email"
                  autoComplete="email"
                  aria-invalid={!!errors.newEmail}
                  {...register("newEmail")}
                />
                {errors.newEmail && (
                  <p className="text-sm text-destructive-strong">
                    {errors.newEmail.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">Your password</Label>
                <PasswordInput
                  id="currentPassword"
                  autoComplete="current-password"
                  aria-invalid={!!errors.currentPassword}
                  {...register("currentPassword")}
                />
                {errors.currentPassword && (
                  <p className="text-sm text-destructive-strong">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending…" : "Send code"}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Enter the code</DialogTitle>
              <DialogDescription>
                We sent a 6-digit code to {pending}. Your email won't change until you
                enter it.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {error && <FormAlert title={error} />}

              <CodeInput
                value={digits}
                onChange={setDigits}
                onComplete={onConfirm}
                disabled={checking}
                autoFocus
              />

              <p className="text-sm text-muted-foreground">
                {checking ? "Checking…" : "Check the spam folder if it hasn't arrived."}
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={close}>
                Cancel
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}