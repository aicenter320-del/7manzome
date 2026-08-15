import "server-only";

import { and, asc, count, desc, eq, isNull, or } from "drizzle-orm";

import { db } from "@/server/db";
import { childTimelineEvents, children, guardianships, users } from "@/server/db/schema";
import type { ChildRow, ChildTimelineEventRow, GuardianshipRow } from "@/server/db/types";
import type { AccessLevel, ChildGender, GuardianRelation } from "@/shared/types/enums";

export async function findChildById(childId: string): Promise<ChildRow | null> {
  const rows = await db.select().from(children).where(eq(children.id, childId)).limit(1);
  return rows[0] ?? null;
}

/** کودکان یک کاربر: هم آن‌هایی که مالک است و هم آن‌هایی که سرپرست است. */
export async function findChildrenForUser(
  userId: string,
  options?: { includeArchived?: boolean },
): Promise<ChildRow[]> {
  const guardianRows = await db
    .select({ childId: guardianships.childId })
    .from(guardianships)
    .where(eq(guardianships.userId, userId));

  const guardianChildIds = guardianRows.map((row) => row.childId);

  const ownershipCondition =
    guardianChildIds.length > 0
      ? or(
          eq(children.ownerUserId, userId),
          ...guardianChildIds.map((childId) => eq(children.id, childId)),
        )
      : eq(children.ownerUserId, userId);

  const conditions = [ownershipCondition];
  if (!options?.includeArchived) conditions.push(isNull(children.archivedAt));

  return db
    .select()
    .from(children)
    .where(and(...conditions))
    .orderBy(asc(children.birthDateAt));
}

/** آیا این کاربر به این کودک دسترسی دارد؟ محافظ اصلی در برابر IDOR. */
export async function findAccessLevel(
  childId: string,
  userId: string,
): Promise<AccessLevel | null> {
  const child = await findChildById(childId);
  if (!child) return null;

  if (child.ownerUserId === userId) return "owner";

  const rows = await db
    .select({ accessLevel: guardianships.accessLevel })
    .from(guardianships)
    .where(and(eq(guardianships.childId, childId), eq(guardianships.userId, userId)))
    .limit(1);

  return rows[0]?.accessLevel ?? null;
}

export async function insertChild(input: {
  ownerUserId: string;
  firstName: string;
  lastName?: string | null;
  nameEn?: string | null;
  gender: ChildGender;
  birthDateAt: number;
  note?: string | null;
}): Promise<ChildRow> {
  const [row] = await db
    .insert(children)
    .values({
      ownerUserId: input.ownerUserId,
      firstName: input.firstName,
      lastName: input.lastName ?? null,
      nameEn: input.nameEn ?? null,
      gender: input.gender,
      birthDateAt: input.birthDateAt,
      note: input.note ?? null,
    })
    .returning();

  if (!row) throw new Error("ساخت پروفایل کودک شکست خورد.");

  return row;
}

export async function updateChild(
  childId: string,
  input: {
    firstName?: string;
    lastName?: string | null;
    nameEn?: string | null;
    gender?: ChildGender;
    birthDateAt?: number;
    note?: string | null;
    avatarFileId?: string | null;
  },
): Promise<void> {
  await db
    .update(children)
    .set({
      ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
      ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
      ...(input.nameEn !== undefined ? { nameEn: input.nameEn } : {}),
      ...(input.gender !== undefined ? { gender: input.gender } : {}),
      ...(input.birthDateAt !== undefined ? { birthDateAt: input.birthDateAt } : {}),
      ...(input.note !== undefined ? { note: input.note } : {}),
      ...(input.avatarFileId !== undefined ? { avatarFileId: input.avatarFileId } : {}),
    })
    .where(eq(children.id, childId));
}

/** بایگانی به‌جای حذف؛ رکوردهای مالی به کودک وصل‌اند. */
export async function archiveChild(childId: string): Promise<void> {
  await db.update(children).set({ archivedAt: Date.now() }).where(eq(children.id, childId));
}

export async function restoreChild(childId: string): Promise<void> {
  await db.update(children).set({ archivedAt: null }).where(eq(children.id, childId));
}

export async function countChildren(): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(children)
    .where(isNull(children.archivedAt));

  return rows[0]?.value ?? 0;
}

export async function findChildrenForAdmin(limit = 100): Promise<
  Array<{
    child: ChildRow;
    ownerPhone: string;
    ownerFirstName: string | null;
    ownerLastName: string | null;
  }>
> {
  return db
    .select({
      child: children,
      ownerPhone: users.phone,
      ownerFirstName: users.firstName,
      ownerLastName: users.lastName,
    })
    .from(children)
    .innerJoin(users, eq(children.ownerUserId, users.id))
    .where(isNull(children.archivedAt))
    .orderBy(desc(children.createdAt))
    .limit(limit);
}

// ------------------------------------------------------------------
// سرپرستی
// ------------------------------------------------------------------

export async function insertGuardianship(input: {
  childId: string;
  userId: string;
  relation: GuardianRelation;
  accessLevel: AccessLevel;
}): Promise<void> {
  await db
    .insert(guardianships)
    .values(input)
    .onConflictDoUpdate({
      target: [guardianships.childId, guardianships.userId],
      set: { relation: input.relation, accessLevel: input.accessLevel },
    });
}

export async function findGuardianships(childId: string): Promise<GuardianshipRow[]> {
  return db.select().from(guardianships).where(eq(guardianships.childId, childId));
}

export async function removeGuardianship(childId: string, userId: string): Promise<void> {
  await db
    .delete(guardianships)
    .where(and(eq(guardianships.childId, childId), eq(guardianships.userId, userId)));
}

// ------------------------------------------------------------------
// تایم‌لاین
// ------------------------------------------------------------------

export async function insertTimelineEvent(input: {
  childId: string;
  title: string;
  occurredAt: number;
  occasionSlug?: string | null;
  note?: string | null;
  createdByUserId?: string | null;
}): Promise<void> {
  await db.insert(childTimelineEvents).values({
    childId: input.childId,
    title: input.title,
    occurredAt: input.occurredAt,
    occasionSlug: input.occasionSlug ?? null,
    note: input.note ?? null,
    createdByUserId: input.createdByUserId ?? null,
  });
}

export async function findTimelineEvents(
  childId: string,
): Promise<ChildTimelineEventRow[]> {
  return db
    .select()
    .from(childTimelineEvents)
    .where(eq(childTimelineEvents.childId, childId))
    .orderBy(desc(childTimelineEvents.occurredAt));
}
