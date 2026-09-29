export type ActivityCategory = "EVENT" | "TASK" | "BUDGET" | "MONEY" | "MEMBER";

export type ActivityView = {
  id: string;
  actorName: string | null;
  category: ActivityCategory;
  action: string;
  summary: string;
  createdAt: string;
};