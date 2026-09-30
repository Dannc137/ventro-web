export type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_COMMENT"
  | "PAYMENT_RECORDED"
  | "MEMBER_JOINED"
  | "EVENT_DATE_CHANGED"
  | "EVENT_VENUE_CHANGED";

export type NotificationView = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  actorName: string | null;
  read: boolean;
  createdAt: string;
};

export type NotificationFeed = {
  unreadCount: number;
  items: NotificationView[];
};