import { api } from "@/lib/api-client";
import type { CommentView, CommentableType, CreateCommentRequest } from "./types";

export async function fetchComments(
  eventId: string,
  entityType: CommentableType,
  entityId: string,
): Promise<CommentView[]> {
  const { data } = await api.get<CommentView[]>(`/events/${eventId}/comments`, {
    params: { entityType, entityId },
  });
  return data;
}

export async function createComment(
  eventId: string,
  body: CreateCommentRequest,
): Promise<CommentView> {
  const { data } = await api.post<CommentView>(`/events/${eventId}/comments`, body);
  return data;
}

export async function deleteComment(eventId: string, commentId: string): Promise<void> {
  await api.delete(`/events/${eventId}/comments/${commentId}`);
}