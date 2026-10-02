import { api } from "@/lib/api-client";
import type {
  MentionTarget,
  MessagePage,
  MessageView,
  SendMessageRequest,
} from "./types";

export async function fetchMessages(
  eventId: string,
  before?: string,
): Promise<MessagePage> {
  const { data } = await api.get<MessagePage>(`/events/${eventId}/chat`, {
    params: before ? { before } : undefined,
  });
  return data;
}

export async function sendMessage(
  eventId: string,
  body: SendMessageRequest,
): Promise<MessageView> {
  const { data } = await api.post<MessageView>(`/events/${eventId}/chat`, body);
  return data;
}

export async function editMessage(
  eventId: string,
  messageId: string,
  body: string,
): Promise<MessageView> {
  const { data } = await api.patch<MessageView>(
    `/events/${eventId}/chat/${messageId}`,
    { body },
  );
  return data;
}

export async function deleteMessage(eventId: string, messageId: string): Promise<void> {
  await api.delete(`/events/${eventId}/chat/${messageId}`);
}

export async function markChatRead(eventId: string): Promise<void> {
  await api.post(`/events/${eventId}/chat/read`);
}

export async function fetchMentionTargets(eventId: string): Promise<MentionTarget[]> {
  const { data } = await api.get<MentionTarget[]>(
    `/events/${eventId}/chat/mention-targets`,
  );
  return data;
}

export async function fetchUnreadCount(eventId: string): Promise<number> {
  const { data } = await api.get<{ count: number }>(`/events/${eventId}/chat/unread`);
  return data.count;
}
