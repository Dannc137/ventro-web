import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ShareLinkProps = {
  url: string;
  message: string;
  shareTitle: string;
};

export function ShareLink({ url, message, shareTitle }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);

  const canShare = typeof navigator !== "undefined" && Boolean(navigator.share);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy. Select the link and copy it manually.");
    }
  }

  async function handleShare() {
    try {
      await navigator.share({ title: shareTitle, text: message, url });
    } catch {
      // The user dismissed the share sheet — nothing to do.
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input readOnly value={url} className="font-mono text-xs" />
        <Button type="button" variant="outline" onClick={handleCopy} className="shrink-0">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            Send on WhatsApp
          </a>
        </Button>

        {canShare && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex-1"
          >
            <Share2 className="size-4" />
            Share
          </Button>
        )}
      </div>
    </div>
  );
}