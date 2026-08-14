import "server-only";

import { recordAudit } from "@/server/audit";
import { revokeAllSessions } from "@/server/auth/session";
import type { UserRow } from "@/server/db/types";
import type { KycStatus, UserRole, UserStatus } from "@/shared/types/enums";

import type { PublicUser } from "../domain/types";
import {
  countCustomersCreatedBetween,
  countUsers,
  findRolesForUser,
  findUserById,
  findUserByNationalId,
  findUserByPhone,
  findUsers,
  grantRole,
  revokeRole,
  updateKyc,
  updateUserProfile,
  updateUserStatus,
  type UserListFilters,
} from "../repo/user.repo";

function toPublicUser(row: UserRow, roles: UserRole[]): PublicUser {
  const displayName =
    [row.firstName, row.lastName].filter(Boolean).join(" ").trim() || row.phone;

  return {
    id: row.id,
    phone: row.phone,
    firstName: row.firstName,
    lastName: row.lastName,
    displayName,
    status: row.status,
    kycStatus: row.kycStatus,
    roles,
    createdAt: row.createdAt,
  };
}

export async function getUserById(userId: string): Promise<PublicUser | null> {
  const row = await findUserById(userId);
  if (!row) return null;

  const roles = await findRolesForUser(userId);
  return toPublicUser(row, roles);
}

export async function getUserByPhone(phone: string): Promise<PublicUser | null> {
  const row = await findUserByPhone(phone);
  if (!row) return null;

  const roles = await findRolesForUser(row.id);
  return toPublicUser(row, roles);
}

/** جزئیات کامل کاربر برای پنل ادمین، شامل کد ملی. */
export async function getUserDetailForAdmin(
  userId: string,
): Promise<(PublicUser & { nationalId: string | null; birthDateAt: number | null }) | null> {
  const row = await findUserById(userId);
  if (!row) return null;

  const roles = await findRolesForUser(userId);

  return {
    ...toPublicUser(row, roles),
    nationalId: row.nationalId,
    birthDateAt: row.birthDateAt,
  };
}

export async function listUsers(filters: UserListFilters = {}): Promise<PublicUser[]> {
  const rows = await findUsers(filters);

  return Promise.all(
    rows.map(async (row) => toPublicUser(row, await findRolesForUser(row.id))),
  );
}

export async function getUserCount(): Promise<number> {
  return countUsers();
}

export async function getCustomerSignupCount(fromAt: number, toAt: number): Promise<number> {
  return countCustomersCreatedBetween(fromAt, toAt);
}

export async function saveProfile(
  userId: string,
  input: { firstName: string; lastName: string; email?: string | null },
): Promise<void> {
  await updateUserProfile(userId, {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email ?? null,
  });
}

export class KycConflictError extends Error {
  constructor() {
    super("این کد ملی قبلاً برای حساب دیگری ثبت شده است.");
    this.name = "KycConflictError";
  }
}

/**
 * ثبت اطلاعات احراز هویت کامل.
 *
 * در MVP اعتبارسنجی الگوریتمی کد ملی انجام می‌شود و وضعیت روی «در انتظار
 * بررسی» می‌رود. استعلام از سرویس رسمی در فازهای بعد اضافه می‌شود
 * (docs/03-modules/identity.md).
 */
export async function submitKycRequest(
  userId: string,
  input: {
    firstName: string;
    lastName: string;
    nationalId: string;
    birthDateAt: number;
  },
): Promise<void> {
  const existing = await findUserByNationalId(input.nationalId);

  if (existing && existing.id !== userId) {
    throw new KycConflictError();
  }

  await updateKyc(userId, {
    firstName: input.firstName,
    lastName: input.lastName,
    nationalId: input.nationalId,
    birthDateAt: input.birthDateAt,
    kycStatus: "pending",
    kycVerifiedAt: null,
    kycRejectionReason: null,
  });

  await recordAudit({
    actorUserId: userId,
    actorRole: "customer",
    action: "kyc.submitted",
    entityType: "user",
    entityId: userId,
    summary: "ارسال اطلاعات احراز هویت",
  });
}

/** تایید یا رد احراز هویت توسط ادمین. */
export async function reviewKyc(input: {
  userId: string;
  decision: Extract<KycStatus, "verified" | "rejected">;
  reason?: string;
  actorUserId: string;
}): Promise<void> {
  await updateKyc(input.userId, {
    kycStatus: input.decision,
    kycVerifiedAt: input.decision === "verified" ? Date.now() : null,
    kycRejectionReason: input.decision === "rejected" ? (input.reason ?? null) : null,
  });

  await recordAudit({
    actorUserId: input.actorUserId,
    action: `kyc.${input.decision}`,
    entityType: "user",
    entityId: input.userId,
    summary:
      input.decision === "verified"
        ? "تایید احراز هویت کاربر"
        : `رد احراز هویت کاربر: ${input.reason ?? "بدون توضیح"}`,
  });
}

export async function setUserStatus(input: {
  userId: string;
  status: UserStatus;
  actorUserId: string;
}): Promise<void> {
  await updateUserStatus(input.userId, input.status);

  // کاربر معلق‌شده باید فوراً از همه دستگاه‌ها بیرون بیفتد.
  if (input.status === "suspended") {
    await revokeAllSessions(input.userId);
  }

  await recordAudit({
    actorUserId: input.actorUserId,
    action: `user.${input.status}`,
    entityType: "user",
    entityId: input.userId,
    summary: input.status === "suspended" ? "تعلیق حساب کاربر" : "فعال‌سازی حساب کاربر",
  });
}

export async function setUserRole(input: {
  userId: string;
  role: UserRole;
  grant: boolean;
  actorUserId: string;
}): Promise<void> {
  if (input.grant) {
    await grantRole(input.userId, input.role, input.actorUserId);
  } else {
    await revokeRole(input.userId, input.role);
  }

  await recordAudit({
    actorUserId: input.actorUserId,
    action: input.grant ? "role.granted" : "role.revoked",
    entityType: "user",
    entityId: input.userId,
    summary: `${input.grant ? "اعطای" : "لغو"} نقش ${input.role}`,
    meta: { role: input.role },
  });
}

export async function getRolesForUser(userId: string): Promise<UserRole[]> {
  return findRolesForUser(userId);
}
