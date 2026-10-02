import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth";
import { publish } from "@/lib/realtime";
import { queryKeys } from "@/lib/query-keys";
import {
  deleteMessage,
  editMessage,
  fetchMentionTargets,
  fetchMessages,
  fetchUnreadCount,
  markChatRead,
  sendMessage,
} from "./api";
import { subscribeTyping, type TypingPayload } from "./typing-bus";
import type { SendMessageRequest } from "./types";

const TYPING_THROTTLE_MS = 2000;
const TYPING_EXPIRY_MS = 4000;
const TYPING_PRUNE_INTERVAL_MS = 1000;

// Each page is oldest-first, but pages[0] is the newest page and later pages
// (loaded via nextCursor) go further back — flatten in reverse page order to
// get a single oldest-to-newest list for rendering.
export function useMessages(eventId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.chat(eventId),
    queryFn: ({ pageParam }) => fetchMessages(eventId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(eventId),
  });
}

export function useSendMessage(eventId: string) {
  return useMutation({
    mutationFn: (body: SendMessageRequest) => sendMessage(eventId, body),
  });
}

export function useEditMessage(eventId: string) {
  return useMutation({
    mutationFn: ({ messageId, body }: { messageId: string; body: string }) =>
      editMessage(eventId, messageId, body),
  });
}

export function useDeleteMessage(eventId: string) {
  return useMutation({
    mutationFn: (messageId: string) => deleteMessage(eventId, messageId),
  });
}

export function useMarkChatRead(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markChatRead(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chatUnread(eventId) });
    },
  });
}

export function useMentionTargets(eventId: string) {
  return useQuery({
    queryKey: queryKeys.mentionTargets(eventId),
    queryFn: () => fetchMentionTargets(eventId),
    enabled: Boolean(eventId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useChatUnread(eventId: string) {
  return useQuery({
    queryKey: queryKeys.chatUnread(eventId),
    queryFn: () => fetchUnreadCount(eventId),
    enabled: Boolean(eventId),
  });
}

export function useTyping(eventId: string) {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingPayload[]>([]);

  const seenRef = useRef(new Map<string, TypingPayload & { at: number }>());
  const lastSentRef = useRef(0);

  function snapshot() {
    setTypingUsers([...seenRef.current.values()].map(({ userId, userName }) => ({ userId, userName })));
  }

  useEffect(() => {
    seenRef.current.clear();
    setTypingUsers([]);

    return subscribeTyping(eventId, (payload) => {
      if (payload.userId === user?.id) return;

      seenRef.current.set(payload.userId, { ...payload, at: Date.now() });
      snapshot();
    });
  }, [eventId, user?.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      const cutoff = Date.now() - TYPING_EXPIRY_MS;
      let changed = false;

      for (const [userId, entry] of seenRef.current) {
        if (entry.at < cutoff) {
          seenRef.current.delete(userId);
          changed = true;
        }
      }

      if (changed) snapshot();
    }, TYPING_PRUNE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  function notifyTyping() {
    const now = Date.now();
    if (now - lastSentRef.current < TYPING_THROTTLE_MS) return;

    lastSentRef.current = now;
    publish(`/app/events/${eventId}/typing`, {});
  }

  return { typingUsers, notifyTyping };
}
