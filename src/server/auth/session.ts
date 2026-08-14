import "server-only";

import { cookies } from "next/headers";
import { and, eq, gt, isNull, lt } from "drizzle-orm";

import { env, isProduction } from "@/shared/config/env";
import type { KycStatus, UserStatus } from "@/shared/types/enums";

import { db } from "../db";
import { sessions, userRoles, users } from "../db/schema";
import { logger } from "../logger";
import { generateToken, hashSecret } from "./crypto";
import { ensureRolePermissionCache } from "./role-cache";

/**
 * سشن کاربر.
 *
 * توکن تصادفی روی کوکی httpOnly می‌نشیند و **هش** آن در دیتابیس ذخیره می‌شود.
 * ابطال سشن یعنی پر کردن revokedAt، پس همیشه امکان بیرون‌انداختن کاربر وجود دارد. (ADR-0010)
 */

export const SESSION_COOKIE = "haft_session";
export const ANON_CART_COOKIE = "haft_cart";

/** عمر سشن: ۳۰ روز. */
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface SessionUser {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  status: UserStatus;
  kycStatus: KycStatus;
  roles: string[];
}

/** ساخت سشن جدید و نوشتن کوکی. */
export async function createSession(
  userId: string,
  meta?: { userAgent?: string; ip?: string },
): Promise<void> {
  const token = generateToken();
  const expiresAt = Date.now() + SESSION_TTL_MS;

  await db.insert(sessions).values({
    userId,
    tokenHash: hashSecret(token),
    userAgent: meta?.userAgent ?? null,
    ip: meta?.ip ?? null,
    expiresAt,
    lastSeenAt: Date.now(),
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    expires: new Date(expiresAt),
  });

  await db.update(users).set({ lastLoginAt: Date.now() }).where(eq(users.id, userId));
}

/**
 * خواندن کاربر جاری.
 *
 * نتیجه در طول یک درخواست کش نمی‌شود چون Next خودش fetch-level caching ندارد
 * برای این مسیر؛ اما کوئری سبک و ایندکس‌شده است.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const tokenHash = hashSecret(token);

  const rows = await db
    .select({
      userId: users.id,
      phone: users.phone,
      firstName: users.firstName,
      lastName: users.lastName,
      status: users.status,
      kycStatus: users.kycStatus,
      sessionId: sessions.id,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(
      and(
        eq(sessions.tokenHash, tokenHash),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, Date.now()),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  // کاربر معلق‌شده حتی با سشن معتبر هم دسترسی ندارد.
  if (row.status === "suspended") return null;

  const roleRows = await db
    .select({ role: userRoles.role })
    .from(userRoles)
    .where(eq(userRoles.userId, row.userId));

  await ensureRolePermissionCache();

  return {
    id: row.userId,
    phone: row.phone,
    firstName: row.firstName,
    lastName: row.lastName,
    displayName: buildDisplayName(row.firstName, row.lastName, row.phone),
    status: row.status,
    kycStatus: row.kycStatus,
    roles: roleRows.map((item) => item.role),
  };
}

/** ابطال سشن جاری و پاک کردن کوکی. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await db
      .update(sessions)
      .set({ revokedAt: Date.now() })
      .where(eq(sessions.tokenHash, hashSecret(token)));
  }

  cookieStore.delete(SESSION_COOKIE);
}

/** ابطال همه سشن‌های یک کاربر؛ برای «خروج از همه دستگاه‌ها». */
export async function revokeAllSessions(userId: string): Promise<void> {
  await db
    .update(sessions)
    .set({ revokedAt: Date.now() })
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));

  logger.info("all sessions revoked", { userId });
}

/** توکن سبد مهمان؛ اگر نبود ساخته می‌شود. */
export async function getOrCreateAnonCartToken(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(ANON_CART_COOKIE)?.value;

  if (existing) return existing;

  const token = generateToken(16);
  cookieStore.set(ANON_CART_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  });

  return token;
}

export async function readAnonCartToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ANON_CART_COOKIE)?.value ?? null;
}

export async function clearAnonCartToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ANON_CART_COOKIE);
}

function buildDisplayName(
  firstName: string | null,
  lastName: string | null,
  phone: string,
): string {
  const full = [firstName, lastName].filter(Boolean).join(" ").trim();
  return full || phone;
}

/** پاک‌سازی سشن‌های منقضی؛ برای اجرای دوره‌ای. */
export async function pruneExpiredSessions(): Promise<void> {
  await db.delete(sessions).where(lt(sessions.expiresAt, Date.now()));
}

export const sessionConfig = {
  cookieName: SESSION_COOKIE,
  ttlMs: SESSION_TTL_MS,
  isProduction,
  nodeEnv: env.NODE_ENV,
} as const;
