import { USER_ROLE_LABELS, USER_ROLES, type UserRole } from "@/shared/types/enums";

/**
 * نقش قابل‌انتخاب در فهرست کاربران.
 * مشتری یعنی هیچ ردیفی در `user_roles` نیست.
 */
export const ASSIGNABLE_ROLES = ["customer", ...USER_ROLES] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export const ASSIGNABLE_ROLE_LABELS: Record<AssignableRole, string> = {
  customer: "مشتری",
  ...USER_ROLE_LABELS,
};

export function assignedRoleFromRoles(roles: readonly UserRole[]): AssignableRole {
  if (roles.includes("super_admin")) return "super_admin";
  const staff = USER_ROLES.find((role) => role !== "super_admin" && roles.includes(role));
  return staff ?? "customer";
}

export function rolesForAssignedRole(role: AssignableRole): UserRole[] {
  if (role === "customer") return [];
  return [role];
}

export function isAssignableRole(value: string): value is AssignableRole {
  return (ASSIGNABLE_ROLES as readonly string[]).includes(value);
}
