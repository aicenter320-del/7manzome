import "server-only";

import { and, count, desc, eq, gte, isNull, like, lt, or } from "drizzle-orm";

import { db } from "@/server/db";
import { userRoles, users } from "@/server/db/schema";
import type { UserRow } from "@/server/db/types";
import type { KycStatus, UserRole, UserStatus } from "@/shared/types/enums";

export async function findUserById(userId: string): Promise<UserRow | null> {
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return rows[0] ?? null;
}

export async function findUserByPhone(phone: string): Promise<UserRow | null> {
  const rows = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
  return rows[0] ?? null;
}

export async function findUserByNationalId(nationalId: string): Promise<UserRow | null> {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.nationalId, nationalId))
    .limit(1);

  return rows[0] ?? null;
}

export async function insertUser(input: { phone: string }): Promise<UserRow> {
  const [row] = await db.insert(users).values({ phone: input.phone }).returning();

  if (!row) throw new Error("ساخت کاربر شکست خورد.");

  return row;
}

export async function updateUserProfile(
  userId: string,
  input: { firstName?: string; lastName?: string; email?: string | null },
): Promise<void> {
  await db
    .update(users)
    .set({
      ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
      ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
    })
    .where(eq(users.id, userId));
}

export async function updateKyc(
  userId: string,
  input: {
    nationalId?: string;
    birthDateAt?: number;
    firstName?: string;
    lastName?: string;
    kycStatus: KycStatus;
    kycVerifiedAt?: number | null;
    kycRejectionReason?: string | null;
  },
): Promise<void> {
  await db
    .update(users)
    .set({
      ...(input.nationalId ? { nationalId: input.nationalId } : {}),
      ...(input.birthDateAt ? { birthDateAt: input.birthDateAt } : {}),
      ...(input.firstName ? { firstName: input.firstName } : {}),
      ...(input.lastName ? { lastName: input.lastName } : {}),
      kycStatus: input.kycStatus,
      kycVerifiedAt: input.kycVerifiedAt ?? null,
      kycRejectionReason: input.kycRejectionReason ?? null,
    })
    .where(eq(users.id, userId));
}

export async function updateUserStatus(userId: string, status: UserStatus): Promise<void> {
  await db.update(users).set({ status }).where(eq(users.id, userId));
}

export async function findRolesForUser(userId: string): Promise<UserRole[]> {
  const rows = await db
    .select({ role: userRoles.role })
    .from(userRoles)
    .where(eq(userRoles.userId, userId));

  return rows.map((row) => row.role);
}

export async function grantRole(
  userId: string,
  role: UserRole,
  grantedByUserId?: string,
): Promise<void> {
  await db
    .insert(userRoles)
    .values({ userId, role, grantedByUserId: grantedByUserId ?? null })
    .onConflictDoNothing();
}

export async function revokeRole(userId: string, role: UserRole): Promise<void> {
  await db
    .delete(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.role, role)));
}

export async function replaceRolesForUser(
  userId: string,
  roles: readonly UserRole[],
  grantedByUserId: string,
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(userRoles).where(eq(userRoles.userId, userId));
    if (roles.length === 0) return;
    await tx.insert(userRoles).values(
      roles.map((role) => ({
        userId,
        role,
        grantedByUserId,
      })),
    );
  });
}

export interface UserListFilters {
  search?: string;
  kycStatus?: KycStatus;
  status?: UserStatus;
  limit?: number;
  offset?: number;
}

export async function findUsers(filters: UserListFilters = {}): Promise<UserRow[]> {
  const conditions = [];

  if (filters.search) {
    const pattern = `%${filters.search}%`;
    conditions.push(
      or(
        like(users.phone, pattern),
        like(users.firstName, pattern),
        like(users.lastName, pattern),
      ),
    );
  }

  if (filters.kycStatus) conditions.push(eq(users.kycStatus, filters.kycStatus));
  if (filters.status) conditions.push(eq(users.status, filters.status));

  const query = db.select().from(users);

  return (conditions.length > 0 ? query.where(and(...conditions)) : query)
    .orderBy(desc(users.createdAt))
    .limit(filters.limit ?? 50)
    .offset(filters.offset ?? 0);
}

export async function deleteUserById(userId: string): Promise<void> {
  await db.delete(users).where(eq(users.id, userId));
}

export async function countUsers(): Promise<number> {
  const rows = await db.select({ value: count() }).from(users);
  return rows[0]?.value ?? 0;
}

/** مشتریان: کاربر بدون نقش کارمندی که در بازه ثبت‌نام کرده. */
export async function countCustomersCreatedBetween(
  fromAt: number,
  toAt: number,
): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(users)
    .leftJoin(userRoles, eq(userRoles.userId, users.id))
    .where(
      and(gte(users.createdAt, fromAt), lt(users.createdAt, toAt), isNull(userRoles.id)),
    );

  return rows[0]?.value ?? 0;
}
