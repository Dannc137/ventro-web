import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { createComment, deleteComment, fetchComments } from "./api";
import type { CommentableType, CreateCommentRequest } from "./types";

export function useComments(
  eventId: string,
  entityType: CommentableType,
  entityId: string | null,
) {
  return useQuery({
    queryKey: queryKeys.comments(entityType, entityId ?? ""),
    queryFn: () => fetchComments(eventId, entityType, entityId!),
    enabled: Boolean(eventId && entityId),
  });
}

export function useCreateComment(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateCommentRequest) => createComment(eventId, body),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments(variables.entityType, variables.entityId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(eventId) });
    },
  });
}

export function useDeleteComment(eventId: string, entityType: CommentableType, entityId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteComment(eventId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments(entityType, entityId),
      });
    },
  });
}