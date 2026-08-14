import "server-only";

import {
  fallbackPermissionsForRoleSlug,
  isAccessSection,
  isPanelAccessLevel,
  permissionsForGrants,
  systemStaffRoleSeedData,
  type SectionGrant,
} from "@/shared/lib/access-matrix";

import { db } from "../db";
import { staffRoleGrants, staffRoles } from "../db/schema";
import { logger } from "../logger";

let cache: Map<string, string[]> | null = null;
let loading: Promise<void> | null = null;

function grantsFromRows(
  rows: readonly { section: string; level: string }[],
): SectionGrant[] {
  const grants: SectionGrant[] = [];
  for (const row of rows) {
    if (!isAccessSection(row.section) || !isPanelAccessLevel(row.level)) continue;
    grants.push({ section: row.section, level: row.level });
  }
  return grants;
}

async function insertMissingSystemRoles(): Promise<void> {
  const existing = await db.select({ slug: staffRoles.slug }).from(staffRoles);
  const have = new Set(existing.map((row) => row.slug));

  for (const role of systemStaffRoleSeedData()) {
    if (have.has(role.slug)) continue;

    const [row] = await db
      .insert(staffRoles)
      .values({
        slug: role.slug,
        title: role.title,
        description: null,
        isSystem: true,
      })
      .returning();

    if (!row) continue;

    const grants = role.grants.filter((grant) => grant.level !== "none");
    if (grants.length === 0) continue;

    await db.insert(staffRoleGrants).values(
      grants.map((grant) => ({
        roleId: row.id,
        section: grant.section,
        level: grant.level,
      })),
    );
  }
}

async function loadCache(): Promise<void> {
  await insertMissingSystemRoles();

  const roles = await db.select().from(staffRoles);
  const grants = await db.select().from(staffRoleGrants);
  const grantsByRole = new Map<string, SectionGrant[]>();

  for (const grant of grants) {
    const list = grantsByRole.get(grant.roleId) ?? [];
    list.push(...grantsFromRows([grant]));
    grantsByRole.set(grant.roleId, list);
  }

  const next = new Map<string, string[]>();
  for (const role of roles) {
    if (role.slug === "super_admin") continue;
    next.set(role.slug, permissionsForGrants(grantsByRole.get(role.id) ?? []));
  }

  cache = next;
}

/** بارگذاری کش مجوز نقش‌ها؛ برای hasPermission همزمان لازم است اول صدا شود. */
export async function ensureRolePermissionCache(): Promise<void> {
  if (cache) return;
  loading ??= loadCache()
    .catch((error: unknown) => {
      logger.error("role permission cache failed", { error: String(error) });
    })
    .finally(() => {
      loading = null;
    });
  await loading;
}

export function invalidateRolePermissionCache(): void {
  cache = null;
}

export function cachedPermissionsForSlug(slug: string): readonly string[] {
  if (slug === "super_admin") return [];
  if (cache) return cache.get(slug) ?? [];
  return fallbackPermissionsForRoleSlug(slug);
}

export function cachedRoleSlugsWithPermission(permission: string): string[] {
  const slugs = ["super_admin"];
  const source = cache;
  if (!source) {
    for (const role of systemStaffRoleSeedData()) {
      if (role.slug === "super_admin") continue;
      if (permissionsForGrants(role.grants).includes(permission)) {
        slugs.push(role.slug);
      }
    }
    return slugs;
  }

  for (const [slug, permissions] of source) {
    if (permissions.includes(permission)) slugs.push(slug);
  }
  return slugs;
}
