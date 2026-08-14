import "server-only";

import { nanoid } from "nanoid";

import { recordAudit } from "@/server/audit";
import { invalidateRolePermissionCache } from "@/server/auth/rbac";
import type { StaffRoleRow } from "@/server/db/types";
import {
  completeGrants,
  isLockedRoleSlug,
  isSystemRoleSlug,
  type SectionGrant,
} from "@/shared/lib/access-matrix";
import { formatPhoneFa } from "@/shared/lib/persian";
import type { AccessSection, PanelAccessLevel } from "@/shared/types/enums";

import {
  countUsersWithRoleSlug,
  deleteStaffRole,
  findGrantsForRole,
  findMembersByRoleSlugs,
  findStaffRoleById,
  findStaffRoleBySlug,
  findStaffRoles,
  insertStaffRole,
  replaceGrantsForRole,
  updateStaffRole,
} from "../repo/staff-role.repo";

export class StaffRoleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StaffRoleError";
  }
}

export interface StaffRoleMember {
  id: string;
  displayName: string;
}

export interface StaffRoleView {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  isSystem: boolean;
  isLocked: boolean;
  userCount: number;
  members: StaffRoleMember[];
  grants: Record<AccessSection, PanelAccessLevel>;
}

function displayNameFor(
  firstName: string | null,
  lastName: string | null,
  phone: string,
): string {
  const full = [firstName, lastName].filter(Boolean).join(" ").trim();
  return full || formatPhoneFa(phone);
}

async function toView(
  row: StaffRoleRow,
  members: StaffRoleMember[] = [],
): Promise<StaffRoleView> {
  const grantRows = await findGrantsForRole(row.id);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    isSystem: row.isSystem,
    isLocked: isLockedRoleSlug(row.slug),
    userCount: members.length,
    members,
    grants: completeGrants(
      grantRows.map((grant) => ({ section: grant.section, level: grant.level })),
    ),
  };
}

export async function listStaffRoles(): Promise<StaffRoleView[]> {
  const rows = await findStaffRoles();
  const memberRows = await findMembersByRoleSlugs(rows.map((row) => row.slug));
  const membersBySlug = new Map<string, StaffRoleMember[]>();

  for (const member of memberRows) {
    const list = membersBySlug.get(member.roleSlug) ?? [];
    list.push({
      id: member.userId,
      displayName: displayNameFor(member.firstName, member.lastName, member.phone),
    });
    membersBySlug.set(member.roleSlug, list);
  }

  return Promise.all(rows.map((row) => toView(row, membersBySlug.get(row.slug) ?? [])));
}

export async function getStaffRole(roleId: string): Promise<StaffRoleView | null> {
  const row = await findStaffRoleById(roleId);
  if (!row) return null;
  const memberRows = await findMembersByRoleSlugs([row.slug]);
  return toView(
    row,
    memberRows.map((member) => ({
      id: member.userId,
      displayName: displayNameFor(member.firstName, member.lastName, member.phone),
    })),
  );
}

export async function listAssignableStaffRoles(): Promise<{ slug: string; title: string }[]> {
  const rows = await findStaffRoles();
  return rows.map((row) => ({ slug: row.slug, title: row.title }));
}

function customRoleSlug(): string {
  return `c_${nanoid(10)}`;
}

export async function createStaffRole(input: {
  title: string;
  description?: string | null;
  grants: readonly SectionGrant[];
  actorUserId: string;
}): Promise<StaffRoleView> {
  const row = await insertStaffRole({
    slug: customRoleSlug(),
    title: input.title,
    description: input.description?.trim() || null,
    isSystem: false,
  });

  await replaceGrantsForRole(row.id, input.grants);
  invalidateRolePermissionCache();

  await recordAudit({
    actorUserId: input.actorUserId,
    action: "role.created",
    entityType: "staff_role",
    entityId: row.id,
    summary: `ساخت نقش ${input.title}`,
    meta: { slug: row.slug },
  });

  return toView(row);
}

export async function saveStaffRole(input: {
  roleId: string;
  title: string;
  description?: string | null;
  grants: readonly SectionGrant[];
  actorUserId: string;
}): Promise<void> {
  const row = await findStaffRoleById(input.roleId);
  if (!row) throw new StaffRoleError("نقش پیدا نشد.");
  if (isLockedRoleSlug(row.slug)) {
    throw new StaffRoleError("نقش مدیر ارشد قابل ویرایش نیست.");
  }

  await updateStaffRole(row.id, {
    title: input.title,
    description: input.description?.trim() || null,
  });
  await replaceGrantsForRole(row.id, input.grants);
  invalidateRolePermissionCache();

  await recordAudit({
    actorUserId: input.actorUserId,
    action: "role.updated",
    entityType: "staff_role",
    entityId: row.id,
    summary: `ویرایش نقش ${input.title}`,
    meta: { slug: row.slug },
  });
}

export async function removeStaffRole(input: {
  roleId: string;
  actorUserId: string;
}): Promise<void> {
  const row = await findStaffRoleById(input.roleId);
  if (!row) throw new StaffRoleError("نقش پیدا نشد.");
  if (row.isSystem || isSystemRoleSlug(row.slug) || isLockedRoleSlug(row.slug)) {
    throw new StaffRoleError("نقش سیستمی حذف نمی‌شود.");
  }

  const assigned = await countUsersWithRoleSlug(row.slug);
  if (assigned > 0) {
    throw new StaffRoleError("نقشی که به کاربری داده شده حذف نمی‌شود.");
  }

  await deleteStaffRole(row.id);
  invalidateRolePermissionCache();

  await recordAudit({
    actorUserId: input.actorUserId,
    action: "role.deleted",
    entityType: "staff_role",
    entityId: row.id,
    summary: `حذف نقش ${row.title}`,
    meta: { slug: row.slug },
  });
}

export async function assertAssignableRoleSlug(slug: string): Promise<void> {
  if (slug === "customer") return;
  const row = await findStaffRoleBySlug(slug);
  if (!row) throw new StaffRoleError("این نقش وجود ندارد.");
}

export { countUsersWithRoleSlug };
