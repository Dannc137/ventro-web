import type { EventStatus } from "@/features/events/types";

export type Permission =
  | "VIEW_EVENT"
  | "EDIT_EVENT"
  | "DELETE_EVENT"
  | "VIEW_TASKS"
  | "EDIT_TASKS"
  | "EDIT_OWN_TASKS"
  | "VIEW_BUDGET"
  | "VIEW_BUDGET_DETAIL"
  | "EDIT_BUDGET"
  | "VIEW_MONEY"
  | "EDIT_MONEY"
  | "MANAGE_MEMBERS"
  | "VIEW_INTERNAL"
  | "VIEW_CHAT";

const WRITE_PERMISSIONS: Permission[] = [
  "EDIT_EVENT",
  "EDIT_TASKS",
  "EDIT_OWN_TASKS",
  "EDIT_BUDGET",
  "EDIT_MONEY",
  "MANAGE_MEMBERS",
];

export function can(
  event: { permissions: Permission[]; status: EventStatus } | undefined,
  permission: Permission,
): boolean {
  if (!event?.permissions.includes(permission)) return false;
  if (event.status === "CANCELLED" && WRITE_PERMISSIONS.includes(permission)) {
    return false;
  }
  return true;
}