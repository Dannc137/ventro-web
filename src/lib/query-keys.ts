export const queryKeys = {
  me: ["me"] as const,
  events: {
    all: ["events"] as const,
    detail: (eventId: string) => ["events", eventId] as const,
  },
  dashboard: (eventId: string) => ["dashboard", eventId] as const,
  tasks: (eventId: string) => ["tasks", eventId] as const,
  members: (eventId: string) => ["members", eventId] as const,
  comments: (entityType: string, entityId: string) =>
    ["comments", entityType, entityId] as const,
  chat: (eventId: string) => ["chat", eventId] as const,
  chatUnread: (eventId: string) => ["chat-unread", eventId] as const,
  mentionTargets: (eventId: string) => ["mention-targets", eventId] as const,
  budget: (eventId: string) => ["budget", eventId] as const,
  money: (eventId: string) => ["money", eventId] as const,
  activity: (eventId: string, limit: number) => ["activity", eventId, limit] as const,
  invites: (eventId: string) => ["invites", eventId] as const,
  notifications: ["notifications"] as const,
} as const
