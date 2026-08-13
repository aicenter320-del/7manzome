import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import type {
  KycStatus,
  OtpPurpose,
  UserRole,
  UserStatus,
} from "@/shared/types/enums";

import {
  boolean,
  counter,
  createdAt,
  idRef,
  jsonColumn,
  primaryId,
  timestamp,
  updatedAt,
} from "../columns";

/** کاربر با شماره موبایل تاییدشده. */
export const users = sqliteTable(
  "users",
  {
    id: primaryId(),
    phone: text("phone").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),

    /** کد ملی؛ داده حساس. در فهرست‌ها ماسک می‌شود. */
    nationalId: text("national_id"),
    birthDateAt: timestamp("birth_date_at"),
    email: text("email"),

    status: text("status").$type<UserStatus>().notNull().default("active"),

    /**
     * وضعیت احراز هویت کامل، عمداً جدا از status.
     * کاربر می‌تواند وارد شود و خرید کند بدون احراز هویت کامل. (ADR-0010)
     */
    kycStatus: text("kyc_status").$type<KycStatus>().notNull().default("none"),
    kycVerifiedAt: timestamp("kyc_verified_at"),
    kycRejectionReason: text("kyc_rejection_reason"),

    lastLoginAt: timestamp("last_login_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("users_phone_unique").on(table.phone),
    uniqueIndex("users_national_id_unique").on(table.nationalId),
    index("users_kyc_status_idx").on(table.kycStatus),
    index("users_created_at_idx").on(table.createdAt),
  ],
);

/** یک کاربر می‌تواند چند نقش داشته باشد. */
export const userRoles = sqliteTable(
  "user_roles",
  {
    id: primaryId(),
    userId: idRef("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").$type<UserRole>().notNull(),
    grantedByUserId: idRef("granted_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("user_roles_user_role_unique").on(table.userId, table.role),
    index("user_roles_role_idx").on(table.role),
  ],
);

/**
 * کد یک‌بارمصرف ورود.
 * کد هرگز به‌صورت متن خام ذخیره نمی‌شود؛ فقط هش HMAC آن.
 */
export const otpCodes = sqliteTable(
  "otp_codes",
  {
    id: primaryId(),
    phone: text("phone").notNull(),
    codeHash: text("code_hash").notNull(),
    purpose: text("purpose").$type<OtpPurpose>().notNull().default("login"),
    attempts: counter("attempts").notNull().default(0),
    maxAttempts: counter("max_attempts").notNull().default(5),
    expiresAt: timestamp("expires_at").notNull(),
    consumedAt: timestamp("consumed_at"),
    requestIp: text("request_ip"),
    createdAt: createdAt(),
  },
  (table) => [
    index("otp_codes_phone_idx").on(table.phone),
    index("otp_codes_expires_at_idx").on(table.expiresAt),
  ],
);

/** سشن فعال. توکن هش‌شده ذخیره می‌شود تا خواندن دیتابیس اجازه جعل ندهد. */
export const sessions = sqliteTable(
  "sessions",
  {
    id: primaryId(),
    userId: idRef("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    userAgent: text("user_agent"),
    ip: text("ip"),
    expiresAt: timestamp("expires_at").notNull(),
    revokedAt: timestamp("revoked_at"),
    lastSeenAt: timestamp("last_seen_at"),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("sessions_token_hash_unique").on(table.tokenHash),
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ],
);

/**
 * ثبت غیرقابل‌تغییر عملیات حساس. ⚠️ append-only
 * تایید پرداخت، تغییر قیمت طلا، تغییر نقش، درج قلم دفتر کل، تغییر وضعیت سفارش.
 */
export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: primaryId(),
    actorUserId: idRef("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    actorRole: text("actor_role").$type<UserRole | "customer" | "system">(),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    summary: text("summary").notNull(),
    meta: jsonColumn<Record<string, unknown>>("meta"),
    ip: text("ip"),
    createdAt: createdAt(),
  },
  (table) => [
    index("audit_logs_entity_idx").on(table.entityType, table.entityId),
    index("audit_logs_actor_idx").on(table.actorUserId),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ],
);

/** محدودیت نرخ عمومی؛ برای درخواست کد یک‌بارمصرف و مشابه آن. */
export const rateLimits = sqliteTable(
  "rate_limits",
  {
    id: primaryId(),
    bucketKey: text("bucket_key").notNull(),
    hits: counter("hits").notNull().default(0),
    windowStartedAt: timestamp("window_started_at").notNull(),
    blockedUntilAt: timestamp("blocked_until_at"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [uniqueIndex("rate_limits_bucket_key_unique").on(table.bucketKey)],
);
