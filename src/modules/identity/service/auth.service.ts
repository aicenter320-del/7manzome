import "server-only";

import { sendOtpSms } from "@/modules/notifications";
import { recordAudit } from "@/server/audit";
import { generateOtpCode, hashSecret, safeCompare } from "@/server/auth/crypto";
import { createSession } from "@/server/auth/session";
import { isStaff } from "@/server/auth/rbac";
import { logger } from "@/server/logger";
import { env } from "@/shared/config/env";
import type { OtpPurpose } from "@/shared/types/enums";

import {
  canResend,
  evaluateRateLimit,
  OTP_MAX_ATTEMPTS,
  OTP_REJECTION_MESSAGES,
  OTP_TTL_MS,
  secondsUntilResend,
  verifyOtpRules,
} from "../domain/otp-policy";
import type { OtpRequestResult } from "../domain/types";
import {
  consumeAllOtpsForPhone,
  findActiveOtp,
  findLastOtp,
  findRateWindow,
  incrementOtpAttempts,
  insertOtp,
  saveRateWindow,
} from "../repo/otp.repo";
import { findUserByPhone, findRolesForUser, insertUser } from "../repo/user.repo";

/**
 * ورود با کد یک‌بارمصرف.
 *
 * قوانین امنیتی کلیدی:
 *   - کد فقط به‌صورت هش HMAC ذخیره می‌شود، هرگز متن خام.
 *   - حداکثر ۵ تلاش برای هر کد.
 *   - حداکثر ۳ درخواست در ۱۰ دقیقه برای هر شماره.
 *   - پیام رد شدن هرگز نمی‌گوید که شماره در سیستم ثبت است یا نه.
 */

export class OtpError extends Error {
  constructor(
    message: string,
    readonly retryAfterSeconds = 0,
  ) {
    super(message);
    this.name = "OtpError";
  }
}

function rateBucketKey(phone: string, purpose: OtpPurpose): string {
  return `otp:${purpose}:${phone}`;
}

/** درخواست کد یک‌بارمصرف. */
export async function requestOtp(input: {
  phone: string;
  purpose?: OtpPurpose;
  ip?: string | null;
}): Promise<OtpRequestResult> {
  const purpose = input.purpose ?? "login";
  const now = Date.now();

  // ۱) فاصله ارسال مجدد
  const lastOtp = await findLastOtp(input.phone, purpose);

  if (lastOtp && !canResend(lastOtp.createdAt, now)) {
    throw new OtpError(
      OTP_REJECTION_MESSAGES.cooldown,
      secondsUntilResend(lastOtp.createdAt, now),
    );
  }

  // ۲) محدودیت نرخ
  const bucketKey = rateBucketKey(input.phone, purpose);
  const window = await findRateWindow(bucketKey);
  const decision = evaluateRateLimit(window, now);

  if (!decision.allowed) {
    logger.warn("otp rate limited", { phone: input.phone, purpose });
    throw new OtpError(OTP_REJECTION_MESSAGES.rate_limited, decision.retryAfterSeconds);
  }

  await saveRateWindow(bucketKey, decision.nextWindow);

  // ۳) ساخت و ارسال کد
  const code = generateOtpCode();
  const expiresAt = now + OTP_TTL_MS;

  await insertOtp({
    phone: input.phone,
    codeHash: hashSecret(code),
    purpose,
    expiresAt,
    maxAttempts: OTP_MAX_ATTEMPTS,
    requestIp: input.ip ?? null,
  });

  // شکست ارسال پیامک عملیات را برنمی‌گرداند؛ کد ثبت شده و کاربر می‌تواند
  // دوباره درخواست کند. اما در محیط توسعه کد در ترمینال دیده می‌شود.
  await sendOtpSms(input.phone, code);

  logger.info("otp requested", { phone: input.phone, purpose });

  return {
    retryAfterSeconds: decision.retryAfterSeconds,
    expiresInSeconds: Math.ceil(OTP_TTL_MS / 1000),
    // فقط در توسعه؛ در production این متغیر باید false باشد.
    ...(env.DEV_EXPOSE_OTP && !env.NODE_ENV.startsWith("production")
      ? { devCode: code }
      : {}),
  };
}

export interface VerifyOtpResult {
  userId: string;
  isNewUser: boolean;
  isStaff: boolean;
}

/**
 * تایید کد و ساخت سشن.
 * اگر شماره کاربر جدیدی باشد، حساب همان لحظه ساخته می‌شود.
 */
export async function verifyOtpAndLogin(input: {
  phone: string;
  code: string;
  purpose?: OtpPurpose;
  userAgent?: string;
  ip?: string | null;
}): Promise<VerifyOtpResult> {
  const purpose = input.purpose ?? "login";
  const stored = await findActiveOtp(input.phone, purpose);

  const matches = stored ? safeCompare(stored.codeHash, hashSecret(input.code)) : false;

  const verification = verifyOtpRules(
    stored
      ? {
          codeHash: stored.codeHash,
          attempts: stored.attempts,
          maxAttempts: stored.maxAttempts,
          expiresAt: stored.expiresAt,
          consumedAt: stored.consumedAt,
          createdAt: stored.createdAt,
        }
      : null,
    matches,
  );

  if (!verification.ok) {
    // شماره تلاش را فقط برای کد نادرست بالا می‌بریم؛ انقضا تلاش محسوب نمی‌شود.
    if (stored && verification.reason === "mismatch") {
      await incrementOtpAttempts(stored.id);
    }

    throw new OtpError(verification.message);
  }

  if (stored) {
    await consumeAllOtpsForPhone(input.phone, purpose);
  }

  const existing = await findUserByPhone(input.phone);
  const user = existing ?? (await insertUser({ phone: input.phone }));

  await createSession(user.id, {
    ...(input.userAgent ? { userAgent: input.userAgent } : {}),
    ...(input.ip ? { ip: input.ip } : {}),
  });

  await recordAudit({
    actorUserId: user.id,
    actorRole: "customer",
    action: existing ? "auth.login" : "auth.signup",
    entityType: "user",
    entityId: user.id,
    summary: existing ? "ورود موفق با کد یک‌بارمصرف" : "ثبت‌نام کاربر جدید",
    ip: input.ip ?? null,
  });

  logger.info("otp verified", { userId: user.id, isNewUser: !existing });

  const roles = await findRolesForUser(user.id);

  return { userId: user.id, isNewUser: !existing, isStaff: isStaff(roles) };
}
