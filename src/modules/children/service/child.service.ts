import "server-only";

import { recordAudit } from "@/server/audit";
import type { ChildRow } from "@/server/db/types";
import { sanitizeText } from "@/shared/lib/persian";
import type { AccessLevel, ChildGender, GuardianRelation } from "@/shared/types/enums";

import { buildDisplayName, computeAgeInfo, validateBirthDate } from "../domain/child-age";
import type { Child, ChildSummary, Guardianship, TimelineEvent } from "../domain/types";
import {
  archiveChild,
  countChildren,
  findAccessLevel,
  findChildById,
  findChildrenForUser,
  findGuardianships,
  findTimelineEvents,
  insertChild,
  insertGuardianship,
  insertTimelineEvent,
  removeGuardianship,
  restoreChild,
  updateChild,
} from "../repo/child.repo";

export class ChildAccessError extends Error {
  constructor() {
    super("به این پروفایل کودک دسترسی ندارید.");
    this.name = "ChildAccessError";
  }
}

export class BirthDateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BirthDateError";
  }
}

function toChild(row: ChildRow): Child {
  return {
    id: row.id,
    ownerUserId: row.ownerUserId,
    firstName: row.firstName,
    lastName: row.lastName,
    nameEn: row.nameEn,
    displayName: buildDisplayName(row.firstName, row.lastName),
    gender: row.gender,
    birthDateAt: row.birthDateAt,
    avatarFileId: row.avatarFileId,
    note: row.note,
    archivedAt: row.archivedAt,
    createdAt: row.createdAt,
  };
}

function toSummary(row: ChildRow): ChildSummary {
  return { ...toChild(row), ...computeAgeInfo(row.birthDateAt) };
}

/**
 * بررسی دسترسی کاربر به کودک.
 *
 * هر سرویسی که با شناسه کودک کار می‌کند **باید** این را صدا بزند.
 * نبود این بررسی یعنی هر کاربری با حدس شناسه به پروفایل دیگران دسترسی دارد.
 */
export async function assertChildAccess(
  childId: string,
  userId: string,
  minimum: AccessLevel = "viewer",
): Promise<AccessLevel> {
  const level = await findAccessLevel(childId, userId);

  if (!level) throw new ChildAccessError();

  const weight: Record<AccessLevel, number> = { viewer: 1, editor: 2, owner: 3 };

  if (weight[level] < weight[minimum]) throw new ChildAccessError();

  return level;
}

export async function getChildrenForUser(userId: string): Promise<ChildSummary[]> {
  const rows = await findChildrenForUser(userId);
  return rows.map(toSummary);
}

export async function getChildById(
  childId: string,
  userId: string,
): Promise<ChildSummary | null> {
  await assertChildAccess(childId, userId);

  const row = await findChildById(childId);
  return row ? toSummary(row) : null;
}

/** خواندن کودک بدون بررسی دسترسی؛ فقط برای مسیرهای عمومی هدیه و پنل ادمین. */
export async function getChildUnchecked(childId: string): Promise<ChildSummary | null> {
  const row = await findChildById(childId);
  return row ? toSummary(row) : null;
}

export async function createChild(input: {
  ownerUserId: string;
  firstName: string;
  lastName?: string;
  nameEn?: string;
  gender: ChildGender;
  birthDateAt: number;
  note?: string;
  relation: GuardianRelation;
}): Promise<Child> {
  const validation = validateBirthDate(input.birthDateAt);
  if (!validation.ok) throw new BirthDateError(validation.message);

  const row = await insertChild({
    ownerUserId: input.ownerUserId,
    firstName: sanitizeText(input.firstName, 50),
    lastName: input.lastName ? sanitizeText(input.lastName, 50) : null,
    nameEn: input.nameEn ?? null,
    gender: input.gender,
    birthDateAt: input.birthDateAt,
    note: input.note ? sanitizeText(input.note, 500) : null,
  });

  // مالک هم به‌عنوان سرپرست ثبت می‌شود تا نسبت او (مادر، پدر) مشخص باشد.
  await insertGuardianship({
    childId: row.id,
    userId: input.ownerUserId,
    relation: input.relation,
    accessLevel: "owner",
  });

  // تولد اولین رویداد تایم‌لاین کودک است.
  await insertTimelineEvent({
    childId: row.id,
    title: "به دنیا آمد",
    occurredAt: input.birthDateAt,
    occasionSlug: "birth",
    createdByUserId: input.ownerUserId,
  });

  await recordAudit({
    actorUserId: input.ownerUserId,
    actorRole: "customer",
    action: "child.created",
    entityType: "child",
    entityId: row.id,
    summary: `ساخت پروفایل کودک ${row.firstName}`,
  });

  return toChild(row);
}

export async function editChild(input: {
  childId: string;
  userId: string;
  firstName?: string;
  lastName?: string | null;
  nameEn?: string | null;
  gender?: ChildGender;
  birthDateAt?: number;
  note?: string | null;
  avatarFileId?: string | null;
}): Promise<void> {
  await assertChildAccess(input.childId, input.userId, "editor");

  if (input.birthDateAt !== undefined) {
    const validation = validateBirthDate(input.birthDateAt);
    if (!validation.ok) throw new BirthDateError(validation.message);
  }

  await updateChild(input.childId, {
    ...(input.firstName !== undefined ? { firstName: sanitizeText(input.firstName, 50) } : {}),
    ...(input.lastName !== undefined
      ? { lastName: input.lastName ? sanitizeText(input.lastName, 50) : null }
      : {}),
    ...(input.nameEn !== undefined ? { nameEn: input.nameEn } : {}),
    ...(input.gender !== undefined ? { gender: input.gender } : {}),
    ...(input.birthDateAt !== undefined ? { birthDateAt: input.birthDateAt } : {}),
    ...(input.note !== undefined
      ? { note: input.note ? sanitizeText(input.note, 500) : null }
      : {}),
    ...(input.avatarFileId !== undefined ? { avatarFileId: input.avatarFileId } : {}),
  });
}

export async function archive(childId: string, userId: string): Promise<void> {
  await assertChildAccess(childId, userId, "owner");
  await archiveChild(childId);

  await recordAudit({
    actorUserId: userId,
    actorRole: "customer",
    action: "child.archived",
    entityType: "child",
    entityId: childId,
    summary: "بایگانی پروفایل کودک",
  });
}

export async function restore(childId: string, userId: string): Promise<void> {
  await assertChildAccess(childId, userId, "owner");
  await restoreChild(childId);
}

export async function getGuardianships(
  childId: string,
  userId: string,
): Promise<Guardianship[]> {
  await assertChildAccess(childId, userId);

  const rows = await findGuardianships(childId);

  return rows.map((row) => ({
    id: row.id,
    childId: row.childId,
    userId: row.userId,
    relation: row.relation,
    accessLevel: row.accessLevel,
    createdAt: row.createdAt,
  }));
}

export async function addGuardian(input: {
  childId: string;
  actorUserId: string;
  userId: string;
  relation: GuardianRelation;
  accessLevel: AccessLevel;
}): Promise<void> {
  await assertChildAccess(input.childId, input.actorUserId, "owner");

  await insertGuardianship({
    childId: input.childId,
    userId: input.userId,
    relation: input.relation,
    accessLevel: input.accessLevel,
  });
}

export async function removeGuardian(input: {
  childId: string;
  actorUserId: string;
  userId: string;
}): Promise<void> {
  await assertChildAccess(input.childId, input.actorUserId, "owner");
  await removeGuardianship(input.childId, input.userId);
}

export async function getTimeline(
  childId: string,
  userId: string,
): Promise<TimelineEvent[]> {
  await assertChildAccess(childId, userId);

  const rows = await findTimelineEvents(childId);

  return rows.map((row) => ({
    id: row.id,
    childId: row.childId,
    occasionSlug: row.occasionSlug,
    title: row.title,
    occurredAt: row.occurredAt,
    note: row.note,
  }));
}

export async function addTimelineEvent(input: {
  childId: string;
  userId: string;
  title: string;
  occurredAt: number;
  occasionSlug?: string;
  note?: string;
}): Promise<void> {
  await assertChildAccess(input.childId, input.userId, "editor");

  await insertTimelineEvent({
    childId: input.childId,
    title: sanitizeText(input.title, 120),
    occurredAt: input.occurredAt,
    occasionSlug: input.occasionSlug ?? null,
    note: input.note ? sanitizeText(input.note, 500) : null,
    createdByUserId: input.userId,
  });
}

export async function getChildCount(): Promise<number> {
  return countChildren();
}
