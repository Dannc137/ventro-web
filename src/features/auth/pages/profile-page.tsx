import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormAlert } from "@/components/shared/form-alert";
import { PasswordInput } from "@/components/shared/password-input";
import { UserAvatar } from "@/components/shared/user-avatar";
import { getErrorMessage } from "@/lib/api-client";
import { useAuth } from "../auth-context";
import { changePassword, updateProfile } from "../api";
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordValues,
  type ProfileValues,
} from "../schemas";
import { ChangeEmailDialog } from "../components/change-email-dialog";

export function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl leading-tight font-semibold tracking-tight">
          Your account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your name is what everyone on your events sees.
        </p>
      </div>

      <NameSection />
      <EmailSection />
      <PasswordSection />
    </div>
  );
}

function NameSection() {
  const { user, refreshUser } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user?.fullName ?? "" },
  });

  useEffect(() => {
    if (user) reset({ fullName: user.fullName });
  }, [user, reset]);

  async function onSubmit(values: ProfileValues) {
    try {
      await updateProfile({ fullName: values.fullName });
      await refreshUser();
      toast.success("Name updated");
      reset(values);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <section className="rounded-lg border bg-card p-5">
      <h2 className="text-[15px] font-semibold">Name</h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 space-y-4">
        <div className="flex items-center gap-3">
          <UserAvatar name={user?.fullName ?? ""} className="size-10 shrink-0" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Label htmlFor="fullName" className="sr-only">
              Full name
            </Label>
            <Input
              id="fullName"
              aria-invalid={!!errors.fullName}
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive-strong">
                {errors.fullName.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function EmailSection() {
  const { user } = useAuth();
  const [changeOpen, setChangeOpen] = useState(false);

  return (
    <section className="rounded-lg border bg-card p-5">
      <h2 className="text-[15px] font-semibold">Email</h2>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user?.email}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-success-strong">
            <Check className="size-3.5" />
            Confirmed
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => setChangeOpen(true)}>
          Change email
        </Button>
      </div>

      <ChangeEmailDialog open={changeOpen} onOpenChange={setChangeOpen} />
    </section>
  );
}

function PasswordSection() {
  const { logout } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  async function onSubmit(values: ChangePasswordValues) {
    setFormError(null);

    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      toast.success("Password changed — sign in again");
      await logout();
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <section className="rounded-lg border bg-card p-5">
      <h2 className="text-[15px] font-semibold">Password</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Changing it signs you out everywhere, including here.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 space-y-4">
        {formError && <FormAlert title={formError} />}

        <div className="space-y-1.5">
          <Label htmlFor="currentPassword">Current password</Label>
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

        <div className="space-y-1.5">
          <Label htmlFor="newPassword">New password</Label>
          <PasswordInput
            id="newPassword"
            autoComplete="new-password"
            aria-invalid={!!errors.newPassword}
            {...register("newPassword")}
          />
          {errors.newPassword ? (
            <p className="text-sm text-destructive-strong">
              {errors.newPassword.message}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">At least 8 characters.</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive-strong">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? "Changing…" : "Change password"}
          </Button>
        </div>
      </form>
    </section>
  );
}