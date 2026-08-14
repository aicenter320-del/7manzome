import { SYSTEM_ROLE_TITLES } from "@/shared/lib/access-matrix";
import { USER_ROLES, type UserRole } from "@/shared/types/enums";

/** مشتری یعنی هیچ ردیفی در `user_roles` نیست. */
export const CUSTOMER_ROLE_SLUG = "customer";

export interface StaffRoleOption {
  slug: string;
  title: string;
}

export const CUSTOMER_ROLE_OPTION: StaffRoleOption = {
  slug: CUSTOMER_ROLE_SLUG,
  title: "مشتری",
};

export function assignableRoleOptions(
  staffRoles: readonly StaffRoleOption[],
): StaffRoleOption[] {
  return [CUSTOMER_ROLE_OPTION, ...staffRoles];
}

export function assignedRoleFromRoles(roles: readonly string[]): string {
  if (roles.includes("super_admin")) return "super_admin";
  return roles[0] ?? CUSTOMER_ROLE_SLUG;
}

export function rolesForAssignedRole(role: string): string[] {
  if (role === CUSTOMER_ROLE_SLUG) return [];
  return [role];
}

export function labelForAssignedRole(
  slug: string,
  options: readonly StaffRoleOption[],
): string {
  if (slug === CUSTOMER_ROLE_SLUG) return CUSTOMER_ROLE_OPTION.title;
  return options.find((option) => option.slug === slug)?.title ?? slug;
}

export function isAssignableRoleValue(
  value: string,
  options: readonly StaffRoleOption[],
): boolean {
  return assignableRoleOptions(options).some((option) => option.slug === value);
}

/** برچسب نقش‌های سیستمی؛ برای تست و seed. */
export const SYSTEM_ASSIGNABLE_LABELS: Record<"customer" | UserRole, string> = {
  customer: CUSTOMER_ROLE_OPTION.title,
  ...SYSTEM_ROLE_TITLES,
};

export const SYSTEM_ASSIGNABLE_SLUGS = [CUSTOMER_ROLE_SLUG, ...USER_ROLES] as const;
