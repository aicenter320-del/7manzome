import "server-only";

import { and, desc, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/server/db";
import { otpCodes, rateLimits } from "@/server/db/schema";
import type { OtpCodeRow } from "@/server/db/types";
import type { OtpPurpose } from "@/shared/types/enums";

import type { RateWindow } from "../domain/otp-policy";

export async function insertOtp(input: {
  phone: string;
  codeHash: string;
  purpose: OtpPurpose;
  expiresAt: number;
  maxAttempts: number;
  requestIp?: string | null;
}): Promise<void> {
  await db.insert(otpCodes).values({
    phone: input.phone,
    codeHash: input.codeHash,
    purpose: input.purpose,
    expiresAt: input.expiresAt,
    maxAttempts: input.maxAttempts,
    requestIp: input.requestIp ?? null,
  });
}

/** آخرین کد مصرف‌نشده برای یک شماره. */
export async function findActiveOtp(
  phone: string,
  purpose: OtpPurpose,
): Promise<OtpCodeRow | null> {
  const rows = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.phone, phone),
        eq(otpCodes.purpose, purpose),
        isNull(otpCodes.consumedAt),
      ),
    )
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);

  return rows[0] ?? null;
}

/** آخرین کد ارسالی (هر وضعیتی)؛ برای محاسبه فاصله ارسال مجدد. */
export async function findLastOtp(
  phone: string,
  purpose: OtpPurpose,
): Promise<OtpCodeRow | null> {
  const rows = await db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.phone, phone), eq(otpCodes.purpose, purpose)))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);

  return rows[0] ?? null;
}

export async function incrementOtpAttempts(otpId: string): Promise<void> {
  await db
    .update(otpCodes)
    .set({ attempts: sql`${otpCodes.attempts} + 1` })
    .where(eq(otpCodes.id, otpId));
}

export async function consumeOtp(otpId: string): Promise<void> {
  await db.update(otpCodes).set({ consumedAt: Date.now() }).where(eq(otpCodes.id, otpId));
}

/** سوزاندن همه کدهای فعال یک شماره؛ هنگام ورود موفق. */
export async function consumeAllOtpsForPhone(
  phone: string,
  purpose: OtpPurpose,
): Promise<void> {
  await db
    .update(otpCodes)
    .set({ consumedAt: Date.now() })
    .where(
      and(
        eq(otpCodes.phone, phone),
        eq(otpCodes.purpose, purpose),
        isNull(otpCodes.consumedAt),
      ),
    );
}

// ------------------------------------------------------------------
// محدودیت نرخ
// ------------------------------------------------------------------

export async function findRateWindow(bucketKey: string): Promise<RateWindow | null> {
  const rows = await db
    .select({ hits: rateLimits.hits, windowStartedAt: rateLimits.windowStartedAt })
    .from(rateLimits)
    .where(eq(rateLimits.bucketKey, bucketKey))
    .limit(1);

  return rows[0] ?? null;
}

export async function saveRateWindow(
  bucketKey: string,
  window: RateWindow,
): Promise<void> {
  await db
    .insert(rateLimits)
    .values({
      bucketKey,
      hits: window.hits,
      windowStartedAt: window.windowStartedAt,
    })
    .onConflictDoUpdate({
      target: rateLimits.bucketKey,
      set: {
        hits: window.hits,
        windowStartedAt: window.windowStartedAt,
        updatedAt: Date.now(),
      },
    });
}
