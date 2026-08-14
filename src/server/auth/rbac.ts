import "server-only";

import { USER_ROLES, type UserRole } from "@/shared/types/enums";

import {
  cachedPermissionsForSlug,
  cachedRoleSlugsWithPermission,
  ensureRolePermissionCache,
} from "./role-cache";

/**
 * دسترسی نقش‌محور.
 *
 * فهرست PERMISSIONS ثابت است. منبع اعطا از نقش‌های دیتابیس (کش) می‌آید.
 * مدیر ارشد همیشه همه مجوزها را دارد و `role:write` فقط او دارد.
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

function asPermissionList(values: readonly string[]): Permission[] {
  return values.filter((value): value is Permission =>
    (PERMISSIONS as readonly string[]).includes(value),
  );
}

/** آیا مجموعه نقش‌های کاربر این مجوز را می‌دهد؟ */
export function hasPermission(roles: readonly string[], permission: Permission): boolean {
  if (roles.includes("super_admin")) return true;
  return roles.some((role) => cachedPermissionsForSlug(role).includes(permission));
}

/** آیا کاربر همه این مجوزها را دارد؟ */
export function hasAllPermissions(
  roles: readonly string[],
  permissions: readonly Permission[],
): boolean {
  return permissions.every((permission) => hasPermission(roles, permission));
}

/** آیا کاربر یکی از این نقش‌ها را دارد؟ */
export function hasRole(roles: readonly string[], allowed: readonly string[]): boolean {
  return roles.some((role) => allowed.includes(role));
}

/** فهرست مجوزهای یک مجموعه نقش؛ برای ساخت منوی پنل ادمین. */
export function permissionsForRoles(roles: readonly string[]): Permission[] {
  if (roles.includes("super_admin")) return [...PERMISSIONS];
  const granted = new Set<Permission>();
  for (const role of roles) {
    for (const permission of asPermissionList(cachedPermissionsForSlug(role))) {
      granted.add(permission);
    }
  }
  return [...granted];
}

/** slug نقش‌هایی که این مجوز را دارند؛ برای اعلان گروهی. */
export async function roleSlugsWithPermission(permission: Permission): Promise<string[]> {
  await ensureRolePermissionCache();
  return cachedRoleSlugsWithPermission(permission);
}

/** آیا این کاربر به پنل مدیریت دسترسی دارد؟ */
export function isStaff(roles: readonly string[]): boolean {
  return roles.length > 0;
}

export function isValidRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}

export { ensureRolePermissionCache, invalidateRolePermissionCache } from "./role-cache";
