import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/shared/user-avatar";
import { getErrorMessage } from "@/lib/api-client";
import { formatRelativeTime } from "@/lib/format";
import { can, type Permission } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useComments, useCreateComment, useDeleteComment } from "../hooks";
import type { CommentableType } from "../types";
import type React from "react";

type CommentThreadProps = {
    eventId: string;
    entityType: CommentableType;
    entityId: string;
    permissions: Permission[] | undefined;
};

export function CommentThread({ eventId, entityType, entityId, permissions }: CommentThreadProps) {
    const comments = useComments(eventId, entityType, entityId);
    const createComment = useCreateComment(eventId);
    const deleteComment = useDeleteComment(eventId, entityType, entityId);

    const [body, setBody] = useState("");
    const [internal, setInternal] = useState(false);

    const canPostInternal = can(permissions, "VIEW_INTERNAL");
    const canModerate = can(permissions, "MANAGE_MEMBERS");

    async function handleSubmit() {
        const trimmed = body.trim();
        if (!trimmed) return;

        try {
            await createComment.mutateAsync({ entityType, entityId, body: trimmed, internal });
            setBody("");
            setInternal(false);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    }

    return (
        <div>
            <h3 className="text-[13px] font-semibold">Comments</h3>

            {comments.isLoading && (
                <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
            )}

            {comments.data?.length === 0 && (
                <p className="mt-3 text-sm text-muted-foreground">
                    No comments yet. Anything decided here stays with the task.
                </p>
            )}

            <ul className="mt-3 space-y-4">
                {comments.data?.map((comment) => (
                    <li
                        key={comment.id}
                        className={cn(
                            "group flex gap-3 rounded-md",
                            comment.internal && "bg-muted p-3",
                        )}
                    >
                        <UserAvatar
                            name={comment.authorName ?? "?"}
                            className="mt-0.5 size-6 shrink-0 text-[10px]"
                        />
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[13px] font-semibold">
                                    {comment.authorName ?? "Former member"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {formatRelativeTime(comment.createdAt)}
                                </span>
                                {comment.edited && (
                                    <span className="text-xs text-muted-foreground">edited</span>
                                )}
                                {comment.internal && (
                                    <span className="rounded-full bg-card px-1.5 text-[11px] font-medium text-muted-foreground">
                                        Internal
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-sm whitespace-pre-wrap text-foreground-soft">
                                {comment.body}
                            </p>
                        </div>

                        {(comment.mine || canModerate) && (
                            <button
                                type="button"
                                onClick={() =>
                                    deleteComment.mutate(comment.id, {
                                        onError: (error) => toast.error(getErrorMessage(error)),
                                    })
                                }
                                aria-label="Delete comment"
                                className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive-strong focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
                            >
                                <Trash2 className="size-3.5" />
                            </button>
                        )}
                    </li>
                ))}
            </ul>

            <div className="mt-4 space-y-2">
                <Textarea
                    value={body}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
                    placeholder="Add a comment"
                    rows={3}
                />
                <div className="flex items-center justify-between gap-3">
                    {canPostInternal ? (
                        <div className="flex items-center gap-2">
                            <Switch id="internal" checked={internal} onCheckedChange={setInternal} />
                            <Label htmlFor="internal" className="text-xs text-muted-foreground">
                                Internal only
                            </Label>
                        </div>
                    ) : (
                        <span />
                    )}
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={!body.trim() || createComment.isPending}
                    >
                        {createComment.isPending ? "Posting…" : "Comment"}
                    </Button>
                </div>
            </div>
        </div>
    );
}