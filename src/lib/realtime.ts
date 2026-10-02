import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { env } from "@/config/env";
import { getAccessToken } from "./api-client";

export type RealtimeMessage = {
  area: string;
  eventId?: string;
  comment?: unknown;
  message?: unknown;
  userId?: string;
  userName?: string;
};

type Handler = (message: RealtimeMessage) => void;

let client: Client | null = null;
const handlers = new Map<string, Set<Handler>>();
const subscriptions = new Map<string, { unsubscribe: () => void }>();

function socketUrl(): string {
  return env.apiBaseUrl.replace(/\/api\/?$/, "") + "/ws";
}

function ensureClient(): Client {
  if (client) return client;

//   console.log("[rt] creating client, url:", socketUrl());

  client = new Client({
    webSocketFactory: () => new SockJS(socketUrl()),
    connectHeaders: {},
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,

    beforeConnect: () => {
      const token = getAccessToken();
    //   console.log("[rt] connecting, token present:", Boolean(token));
      client!.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};
    },

    onConnect: () => {
    //   console.log("[rt] CONNECTED. pending destinations:", [...handlers.keys()]);
      for (const destination of handlers.keys()) {
        subscribeRaw(destination);
      }
    },

    onStompError: (frame) => {
      console.error("[rt] STOMP error:", frame.headers["message"], frame.body);
    },

    onWebSocketClose: () => {
      console.warn("[rt] socket closed");
    },
  });

  client.activate();
  return client;
}

function subscribeRaw(destination: string) {
  if (!client?.connected) {
    // console.log("[rt] not connected yet, deferring:", destination);
    return;
  }
  if (subscriptions.has(destination)) {
    // console.log("[rt] already subscribed:", destination);
    return;
  }

//   console.log("[rt] SUBSCRIBE ->", destination);

  const sub = client.subscribe(destination, (frame: IMessage) => {
    // console.log("[rt] MESSAGE on", destination, frame.body);
    try {
      const message = JSON.parse(frame.body) as RealtimeMessage;
      handlers.get(destination)?.forEach((handler) => handler(message));
    } catch (err) {
      console.error("[rt] bad frame", err);
    }
  });

  subscriptions.set(destination, sub);
}

export function subscribe(destination: string, handler: Handler): () => void {
//   console.log("[rt] subscribe() called for", destination);
  ensureClient();

  if (!handlers.has(destination)) handlers.set(destination, new Set());
  handlers.get(destination)!.add(handler);

  subscribeRaw(destination);

  return () => {
    const set = handlers.get(destination);
    set?.delete(handler);

    if (set && set.size === 0) {
      setTimeout(() => {
        if (handlers.get(destination)?.size === 0) {
        //   console.log("[rt] tearing down", destination);
          handlers.delete(destination);
          subscriptions.get(destination)?.unsubscribe();
          subscriptions.delete(destination);
        }
      }, 0);
    }
  };
}

export function publish(destination: string, body: object): void {
  if (!client?.connected) return;
  client.publish({ destination, body: JSON.stringify(body) });
}

export function disconnectRealtime() {
//   console.log("[rt] disconnecting");
  subscriptions.forEach((sub) => sub.unsubscribe());
  subscriptions.clear();
  handlers.clear();

  void client?.deactivate();
  client = null;
}