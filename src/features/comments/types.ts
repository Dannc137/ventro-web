export type CommentableType = "TASK" | "BUDGET_ITEM" | "CONTRIBUTION";

export type CommentView = {
  id: string;
  body: string;
  internal: boolean;
  authorId: string | null;
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
  edited: boolean;
  mine: boolean;
};

export type CreateCommentRequest = {
  entityType: CommentableType;
  entityId: string;
  body: string;
  internal?: boolean;
};

export type CommentBroadcast = {
  id: string;
  entityId: string;
  entityType: CommentableType;
  body: string;
  internal: boolean;
  authorId: string | null;
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
};