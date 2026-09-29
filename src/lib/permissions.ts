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
  | "VIEW_INTERNAL";

export function can(
  permissions: Permission[] | undefined,
  permission: Permission,
): boolean {
  return permissions?.includes(permission) ?? false;
}