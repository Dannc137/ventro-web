import type { EventRole } from "@/features/events/types";

export type ScheduleStat = {
  totalTasks: number;
  doneTasks: number;
  overdueTasks: number;
  percentComplete: number;
  percentTimeElapsed: number;
  daysBehind: number;
  status: string;
};

export type BudgetStat = {
  planned: number;
  committed: number;
  paid: number;
  outstanding: number;
  remaining: number;
  percentCommitted: number;
  overBudget: boolean;
  status: string;
};

export type FundingStat = {
  pledged: number;
  received: number;
  needed: number;
  gap: number;
  percentFunded: number;
  status: string;
};

export type BlockerInsight = {
  taskId: string;
  title: string;
  dueDate: string;
  daysUntilDue: number;
  overdue: boolean;
  blockedCount: number;
  blockedTitles: string[];
  assignee: { id: string; fullName: string } | null;
};

export type ActivityEntry = {
  id: string;
  actorName: string | null;
  category: "EVENT" | "TASK" | "BUDGET" | "MONEY" | "MEMBER";
  action: string;
  summary: string;
  createdAt: string;
};

export type DashboardView = {
  eventId: string;
  name: string;
  eventDate: string;
  venue: string | null;
  daysUntilEvent: number;
  myRole: EventRole;
  healthScore: number;
  healthStatus: string;
  schedule: ScheduleStat;
  budget: BudgetStat | null;
  funding: FundingStat | null;
  myContribution: MyContribution | null;
  topBlockers: BlockerInsight[];
  recentActivity: ActivityEntry[];
};

export type MyContribution = {
  pledged: number;
  received: number;
  outstanding: number;
  settled: boolean;
};