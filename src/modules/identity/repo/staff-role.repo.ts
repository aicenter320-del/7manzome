import "server-only";

import { count, eq, inArray } from "drizzle-orm";

import { db } from "@/server/db";
import { staffRoleGrants, staffRoles, userRoles, users } from "@/server/db/schema";
import type { StaffRoleGrantRow, StaffRoleRow } from "@/server/db/types";
import type { AccessSection, PanelAccessLevel } from "@/shared/types/enums";

export async function findStaffRoles(): Promise<StaffRoleRow[]> {
  return db.select().from(staffRoles).orderBy(staffRoles.createdAt);
}

export async function findStaffRoleById(id: string): Promise<StaffRoleRow | null> {
  const rows = await db.select().from(staffRoles).where(eq(staffRoles.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function findStaffRoleBySlug(slug: string): Promise<StaffRoleRow | null> {
  const rows = await db.select().from(staffRoles).where(eq(staffRoles.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function findGrantsForRole(roleId: string): Promise<StaffRoleGrantRow[]> {
  return db.select().from(staffRoleGrants).where(eq(staffRoleGrants.roleId, roleId));
}

export async function insertStaffRole(input: {
  slug: string;
  title: string;
  description: string | null;
  isSystem: boolean;
}): Promise<StaffRoleRow> {
  const [row] = await db
    .insert(staffRoles)
    .values({
      slug: input.slug,
      title: input.title,
      description: input.description,
      isSystem: input.isSystem,
    })
    .returning();

  if (!row) throw new Error("ساخت نقش شکست خورد.");
  return row;
}

export async function updateStaffRole(
  roleId: string,
  input: { title: string; description: string | null },
): Promise<void> {
  await db
    .update(staffRoles)
    .set({ title: input.title, description: input.description })
    .where(eq(staffRoles.id, roleId));
}

export async function replaceGrantsForRole(
  roleId: string,
  grants: readonly { section: AccessSection; level: PanelAccessLevel }[],
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(staffRoleGrants).where(eq(staffRoleGrants.roleId, roleId));
    const keep = grants.filter((grant) => grant.level !== "none");
    if (keep.length === 0) return;
    await tx.insert(staffRoleGrants).values(
      keep.map((grant) => ({
        roleId,
        section: grant.section,
        level: grant.level,
      })),
    );
  });
}

export async function deleteStaffRole(roleId: string): Promise<void> {
  await db.delete(staffRoles).where(eq(staffRoles.id, roleId));
}

export async function countUsersWithRoleSlug(slug: string): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(userRoles)
    .where(eq(userRoles.role, slug));
  return rows[0]?.value ?? 0;
}

export interface RoleMemberRow {
  roleSlug: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  phone: string;
}

/** کاربران هر نقش؛ برای فهرست پنل. */
export async function findMembersByRoleSlugs(
  slugs: readonly string[],
): Promise<RoleMemberRow[]> {
  if (slugs.length === 0) return [];

  return db
    .select({
      roleSlug: userRoles.role,
      userId: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      phone: users.phone,
    })
    .from(userRoles)
    .innerJoin(users, eq(users.id, userRoles.userId))
    .where(inArray(userRoles.role, [...slugs]));
}
