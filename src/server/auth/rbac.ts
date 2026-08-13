import "server-only";

import { USER_ROLES, type UserRole } from "@/shared/types/enums";

/**
 * دسترسی نقش‌محور.
 *
 * از روز اول پیاده می‌شود چون افزودن آن بعداً به معنی بازبینی هر اکشن است.
 * مرجع نقش‌ها: docs/00-overview/personas.md
 */

export const PERMISSIONS = [
  // سفارش
  "order:read",
  "order:transition",
  "order:cancel",
  // پرداخت
  "payment:read",
  "payment:review",
  // قیمت
  "gold_price:read",
  "gold_price:write",
  // کاتالوگ
  "catalog:read",
  "catalog:write",
  // کاربران و کودکان
  "user:read",
  "user:write",
  "role:write",
  "child:read",
  // گنجینه
  "treasury:read",
  "treasury:adjust",
  // ارسال
  "shipment:read",
  "shipment:write",
  // محتوا و تنظیمات
  "content:write",
  "settings:write",
  // گزارش
  "report:read",
  // پیامک و اعلان
  "sms:read",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  super_admin: PERMISSIONS,

  finance: [
    "payment:read",
    "payment:review",
    "order:read",
    "gold_price:read",
    "gold_price:write",
    "treasury:read",
    "treasury:adjust",
    "report:read",
    "user:read",
  ],

  order_manager: [
    "order:read",
    "order:transition",
    "order:cancel",
    "payment:read",
    "shipment:read",
    "shipment:write",
    "catalog:read",
    "user:read",
    "report:read",
  ],

  content_manager: ["catalog:read", "catalog:write", "content:write", "gold_price:read"],

  customer_support: [
    "order:read",
    "payment:read",
    "user:read",
    "child:read",
    "treasury:read",
    "sms:read",
    "catalog:read",
  ],

  fulfillment: [
    "order:read",
    "order:transition",
    "shipment:read",
    "shipment:write",
    "catalog:read",
  ],
};

/** آیا مجموعه نقش‌های کاربر این مجوز را می‌دهد؟ */
export function hasPermission(
  roles: readonly UserRole[],
  permission: Permission,
): boolean {
  return roles.some((role) => ROLE_PERMISSIONS[role]?.includes(permission));
}

/** آیا کاربر همه این مجوزها را دارد؟ */
export function hasAllPermissions(
  roles: readonly UserRole[],
  permissions: readonly Permission[],
): boolean {
  return permissions.every((permission) => hasPermission(roles, permission));
}

/** آیا کاربر یکی از این نقش‌ها را دارد؟ */
export function hasRole(roles: readonly UserRole[], allowed: readonly UserRole[]): boolean {
  return roles.some((role) => allowed.includes(role));
}

/** فهرست مجوزهای یک مجموعه نقش؛ برای ساخت منوی پنل ادمین. */
export function permissionsForRoles(roles: readonly UserRole[]): Permission[] {
  const granted = new Set<Permission>();
  for (const role of roles) {
    for (const permission of ROLE_PERMISSIONS[role] ?? []) granted.add(permission);
  }
  return [...granted];
}

/** آیا این کاربر به پنل مدیریت دسترسی دارد؟ */
export function isStaff(roles: readonly UserRole[]): boolean {
  return roles.length > 0;
}

export function isValidRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}
