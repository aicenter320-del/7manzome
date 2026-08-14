import type { AccessSection, PanelAccessLevel, UserRole } from "@/shared/types/enums";
import {
  ACCESS_SECTIONS,
  PANEL_ACCESS_LEVELS,
  USER_ROLES,
} from "@/shared/types/enums";

/**
 * نگاشت سطح بخش پنل به مجوزهای موجود.
 *
 * این فایل در shared است چون هم rbac (لایه server) و هم دامنه هویت به آن
 * نیاز دارند و server حق import از modules را ندارد.
 *
 * `role:write` عمداً اینجا نیست؛ فقط مدیر ارشد آن را دارد.
 */
const SECTION_PERMISSIONS: Record<
  AccessSection,
  Record<Exclude<PanelAccessLevel, "none">, readonly string[]>
> = {
  orders: {
    read: ["order:read"],
    write: ["order:read", "order:transition", "shipment:read", "shipment:write"],
    full: ["order:read", "order:transition", "shipment:read", "shipment:write", "order:cancel"],
  },
  payments: {
    read: ["payment:read"],
    write: ["payment:read"],
    full: ["payment:read", "payment:review"],
  },
  users: {
    read: ["user:read"],
    write: ["user:read", "user:write"],
    full: ["user:read", "user:write"],
  },
  children: {
    read: ["child:read"],
    write: ["child:read"],
    full: ["child:read"],
  },
  treasures: {
    read: ["treasury:read"],
    write: ["treasury:read"],
    full: ["treasury:read", "treasury:adjust"],
  },
  catalog: {
    read: ["catalog:read"],
    write: ["catalog:read", "catalog:write"],
    full: ["catalog:read", "catalog:write"],
  },
  gold_price: {
    read: ["gold_price:read"],
    write: ["gold_price:read", "gold_price:write"],
    full: ["gold_price:read", "gold_price:write"],
  },
  content: {
    read: [],
    write: ["content:write"],
    full: ["content:write"],
  },
  settings: {
    read: [],
    write: ["settings:write"],
    full: ["settings:write"],
  },
  reports: {
    read: ["report:read"],
    write: ["report:read"],
    full: ["report:read"],
  },
  sms: {
    read: ["sms:read"],
    write: ["sms:read"],
    full: ["sms:read"],
  },
};

export type SectionGrant = { section: AccessSection; level: PanelAccessLevel };

export function permissionsForGrant(
  section: AccessSection,
  level: PanelAccessLevel,
): readonly string[] {
  if (level === "none") return [];
  return SECTION_PERMISSIONS[section][level];
}

export function permissionsForGrants(grants: readonly SectionGrant[]): string[] {
  const granted = new Set<string>();
  for (const grant of grants) {
    for (const permission of permissionsForGrant(grant.section, grant.level)) {
      granted.add(permission);
    }
  }
  return [...granted];
}

export const SYSTEM_ROLE_GRANTS: Record<Exclude<UserRole, "super_admin">, readonly SectionGrant[]> =
  {
    finance: [
      { section: "payments", level: "full" },
      { section: "orders", level: "read" },
      { section: "gold_price", level: "full" },
      { section: "treasures", level: "full" },
      { section: "reports", level: "full" },
      { section: "users", level: "read" },
    ],
    order_manager: [
      { section: "orders", level: "full" },
      { section: "payments", level: "read" },
      { section: "catalog", level: "read" },
      { section: "users", level: "read" },
      { section: "reports", level: "full" },
    ],
    content_manager: [
      { section: "catalog", level: "full" },
      { section: "content", level: "full" },
      { section: "gold_price", level: "read" },
    ],
    customer_support: [
      { section: "orders", level: "read" },
      { section: "payments", level: "read" },
      { section: "users", level: "read" },
      { section: "children", level: "full" },
      { section: "treasures", level: "read" },
      { section: "sms", level: "full" },
      { section: "catalog", level: "read" },
    ],
    fulfillment: [
      { section: "orders", level: "write" },
      { section: "catalog", level: "read" },
    ],
  };

export const SYSTEM_ROLE_TITLES: Record<UserRole, string> = {
  super_admin: "مدیر ارشد",
  finance: "مالی",
  order_manager: "مدیر سفارش‌ها",
  content_manager: "مدیر محتوا",
  customer_support: "پشتیبانی مشتریان",
  fulfillment: "آماده‌سازی و ارسال",
};

export function isSystemRoleSlug(slug: string): slug is UserRole {
  return (USER_ROLES as readonly string[]).includes(slug);
}

export function isLockedRoleSlug(slug: string): boolean {
  return slug === "super_admin";
}

export function grantsForSystemRole(slug: UserRole): readonly SectionGrant[] {
  if (slug === "super_admin") return [];
  return SYSTEM_ROLE_GRANTS[slug];
}

export function fallbackPermissionsForRoleSlug(slug: string): readonly string[] {
  if (!isSystemRoleSlug(slug)) return [];
  return permissionsForGrants(grantsForSystemRole(slug));
}

export function completeGrants(
  grants: readonly SectionGrant[],
): Record<AccessSection, PanelAccessLevel> {
  const map = {} as Record<AccessSection, PanelAccessLevel>;
  for (const section of ACCESS_SECTIONS) map[section] = "none";
  for (const grant of grants) map[grant.section] = grant.level;
  return map;
}

export function isPanelAccessLevel(value: string): value is PanelAccessLevel {
  return (PANEL_ACCESS_LEVELS as readonly string[]).includes(value);
}

export function isAccessSection(value: string): value is AccessSection {
  return (ACCESS_SECTIONS as readonly string[]).includes(value);
}

export interface SystemStaffRoleSeed {
  slug: UserRole;
  title: string;
  isSystem: true;
  grants: readonly SectionGrant[];
}

/** دادهٔ شش نقش اولیه برای seed و پر کردن جدول خالی. */
export function systemStaffRoleSeedData(): readonly SystemStaffRoleSeed[] {
  return USER_ROLES.map((slug) => ({
    slug,
    title: SYSTEM_ROLE_TITLES[slug],
    isSystem: true as const,
    grants: grantsForSystemRole(slug),
  }));
}
