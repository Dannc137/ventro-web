import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingDots } from "@/components/shared/loading-dots";
import { ShareLink } from "@/components/shared/share-link";
import { getErrorMessage } from "@/lib/api-client";
import type { EventRole } from "@/features/events/types";
import { useCreateInviteLink, useInviteMember } from "../hooks";

const ROLE_HELP: Record<string, string> = {
  PLANNER: "Can do everything except delete the event or change who owns it.",
  CONTRIBUTOR: "Sees tasks and money coming in. Can only edit tasks assigned to them.",
  CLIENT: "Read-only. Sees progress and the budget total, nothing else.",
};

const emailSchema = z.object({
  email: z.email("Enter a valid email address"),
  role: z.string(),
});

type EmailValues = z.infer<typeof emailSchema>;

type InviteDialogProps = {
  eventId: string;
  eventName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InviteDialog({
  eventId,
  eventName,
  open,
  onOpenChange,
}: InviteDialogProps) {
  const inviteMember = useInviteMember(eventId);
  const createLink = useCreateInviteLink(eventId);

  const [linkRole, setLinkRole] = useState<EventRole>("CONTRIBUTOR");
  const [linkToken, setLinkToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { role: "CONTRIBUTOR" },
  });

  const emailRole = watch("role");

  async function onEmailSubmit(values: EmailValues) {
    try {
      await inviteMember.mutateAsync({
        email: values.email,
        role: values.role as EventRole,
      });

      toast.success("Invite sent");
      reset({ email: "", role: values.role });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleCreateLink() {
    try {
      const invite = await createLink.mutateAsync({
        role: linkRole,
        expiresInDays: 7,
      });
      setLinkToken(invite.token);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  const linkUrl = linkToken ? `${window.location.origin}/invite/${linkToken}` : "";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setLinkToken(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite people</DialogTitle>
          <DialogDescription>
            Give each person the access they need, and nothing more.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="email">
          <TabsList className="w-full">
            <TabsTrigger value="email" className="flex-1">
              By email
            </TabsTrigger>
            <TabsTrigger value="link" className="flex-1">
              Share a link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="mt-4">
            <form onSubmit={handleSubmit(onEmailSubmit)} noValidate className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email">Their email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ada@example.com"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive-strong">{errors.email.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  They need a Ventro account already. If they don't have one, share a link
                  instead.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emailRole">Access level</Label>
                <Select value={emailRole} onValueChange={(v) => setValue("role", v)}>
                  <SelectTrigger id="emailRole" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNER">Planner</SelectItem>
                    <SelectItem value="CONTRIBUTOR">Contributor</SelectItem>
                    <SelectItem value="CLIENT">Client</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{ROLE_HELP[emailRole]}</p>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      Sending <LoadingDots />
                    </>
                  ) : (
                    "Send invite"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="link" className="mt-4 space-y-5">
            {linkToken ? (
              <>
                <ShareLink
                  url={linkUrl}
                  message={`Join me in planning ${eventName} on Ventro:`}
                  shareTitle={`Join ${eventName}`}
                />
                <p className="rounded-md bg-muted px-3 py-2.5 text-xs text-muted-foreground">
                  Anyone with this link joins as a{" "}
                  {linkRole === "CLIENT" ? "Client" : "Contributor"}. It expires in 7 days.
                </p>
                <Button variant="ghost" size="sm" onClick={() => setLinkToken(null)}>
                  Create a different link
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="linkRole">Access level</Label>
                  <Select
                    value={linkRole}
                    onValueChange={(v) => setLinkRole(v as EventRole)}
                  >
                    <SelectTrigger id="linkRole" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONTRIBUTOR">Contributor</SelectItem>
                      <SelectItem value="CLIENT">Client</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{ROLE_HELP[linkRole]}</p>
                </div>

                <p className="rounded-md bg-warning-tint px-3 py-2.5 text-xs text-warning-strong">
                  Links can be forwarded, so they can't grant Planner access. Use an email
                  invite for that.
                </p>

                <Button onClick={handleCreateLink} disabled={createLink.isPending}>
                  {createLink.isPending ? (
                    <>
                      Creating <LoadingDots />
                    </>
                  ) : (
                    "Create link"
                  )}
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}