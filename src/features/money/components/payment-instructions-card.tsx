import { useState } from "react";
import { Check, Copy, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/api-client";
import { useSetPaymentInstructions } from "../hooks";

type PaymentInstructionsCardProps = {
  eventId: string;
  instructions: string | null;
  canEdit: boolean;
};

export function PaymentInstructionsCard({
  eventId,
  instructions,
  canEdit,
}: PaymentInstructionsCardProps) {
  const save = useSetPaymentInstructions(eventId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(instructions ?? "");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!instructions) return;

    try {
      await navigator.clipboard.writeText(instructions);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy. Select the text and copy it manually.");
    }
  }

  async function handleSave() {
    try {
      await save.mutateAsync(draft.trim());
      setEditing(false);
      toast.success("Payment details saved");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  if (editing) {
    return (
      <div className="rounded-lg border bg-card p-5">
        <h2 className="text-[13px] font-semibold">Where to send money</h2>
        <Textarea
          aria-label="Payment instructions"
          value={draft}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraft(e.target.value)}
          rows={3}
          placeholder="GTBank 0123456789 — Daniel Okoro. Send a screenshot after transfer."
          className="mt-3"
        />
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setDraft(instructions ?? "");
              setEditing(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (!instructions) {
    if (!canEdit) return null;

    return (
      <div className="rounded-lg border border-dashed p-5">
        <h2 className="text-[13px] font-semibold">Where to send money</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your account details so contributors know where to pay.
        </p>
        <Button size="sm" variant="outline" className="mt-3" onClick={() => setEditing(true)}>
          Add payment details
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-primary-tint p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-[13px] font-semibold text-primary-strong">
            Where to send money
          </h2>
          <p className="mt-1 text-sm whitespace-pre-wrap text-primary-strong">
            {instructions}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button size="sm" variant="ghost" onClick={handleCopy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          {canEdit && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditing(true)}
              aria-label="Edit payment details"
            >
              <Pencil className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}