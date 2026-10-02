export type MessageView = {
  id: string;
  body: string | null;
  authorId: string | null;
  authorName: string | null;
  replyToId: string | null;
  replyToBody: string | null;
  replyToAuthorName: string | null;
  edited: boolean;
  deleted: boolean;
  mine: boolean;
  createdAt: string;
};

export type MessageBroadcast = Omit<MessageView, "mine">;

export type MessagePage = {
  items: MessageView[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type MentionTarget = {
  userId: string;
  fullName: string;
};

export type SendMessageRequest = {
  body: string;
  replyToId?: string | null;
};