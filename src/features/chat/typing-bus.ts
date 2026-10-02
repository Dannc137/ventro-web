// A tiny module-level emitter, same shape as the subscribe/handler map in
// `@/lib/realtime` — `use-event-realtime.ts` forwards "typing" broadcasts
// here, and `useTyping` listens. Nothing here is persisted or cached, so it
// doesn't belong in the query client the way the chat messages do.

export type TypingPayload = { userId: string; userName: string };

type Handler = (payload: TypingPayload) => void;

const handlers = new Map<string, Set<Handler>>();

export function emitTyping(eventId: string, payload: TypingPayload): void {
  handlers.get(eventId)?.forEach((handler) => handler(payload));
}

export function subscribeTyping(eventId: string, handler: Handler): () => void {
  if (!handlers.has(eventId)) handlers.set(eventId, new Set());
  handlers.get(eventId)!.add(handler);

  return () => {
    handlers.get(eventId)?.delete(handler);
  };
}
