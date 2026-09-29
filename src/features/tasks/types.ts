export type TaskStatus = "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";

export type AssigneeSummary = {
  id: string;
  fullName: string;
};

export type TaskView = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  category: string | null;
  dueDate: string;
  dateIsFixed: boolean;
  daysUntilDue: number;
  overdue: boolean;
  blockedByCount: number;
  blockingCount: number;
  assignee: AssigneeSummary | null;
};

export type TaskBucket = {
  label: string;
  tasks: TaskView[];
};

export type CreateTaskRequest = {
  title: string;
  description?: string;
  category?: string;
  offsetDays?: number;
  fixedDate?: string;
  assigneeId?: string;
};

export type UpdateTaskRequest = {
  title?: string;
  description?: string;
  category?: string;
  offsetDays?: number;
  fixedDate?: string;
  assigneeId?: string;
  status?: TaskStatus;
};