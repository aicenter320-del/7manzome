import "server-only";

import { recordAudit } from "@/server/audit";
import { revokeAllSessions } from "@/server/auth/session";
import type { UserRow } from "@/server/db/types";
import type { UserStatus } from "@/shared/types/enums";

import { canAdminDecideKyc, type KycDecision } from "../domain/kyc-status";
import type { AdminUserDetail, PublicUser } from "../domain/types";
import {
  labelForAssignedRole,
  rolesForAssignedRole,
} from "../domain/user-access";
import { assertAssignableRoleSlug, countUsersWithRoleSlug, listAssignableStaffRoles } from "./staff-role.service";
import {
  countCustomersCreatedBetween,
  countUsers,
  deleteUserById,
  findRolesForUser,
  findUserById,
  findUserByNationalId,
  findUserByPhone,
  findUsers,
  grantRole,
  replaceRolesForUser,
  revokeRole,
  updateKyc,
  updateUserProfile,
  updateUserStatus,
  type UserListFilters,
} from "../repo/user.repo";

function toPublicUser(row: UserRow, roles: string[]): PublicUser {
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
): Promise<AdminUserDetail | null> {
  const row = await findUserById(userId);
  if (!row) return null;

  const roles = await findRolesForUser(userId);

  return {
    ...toPublicUser(row, roles),
    email: row.email,
    nationalId: row.nationalId,
    birthDateAt: row.birthDateAt,
    kycVerifiedAt: row.kycVerifiedAt,
    kycRejectionReason: row.kycRejectionReason,
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

export class InvalidKycDecisionError extends Error {
  constructor() {
    super("این تصمیم برای وضعیت فعلی احراز هویت مجاز نیست.");
    this.name = "InvalidKycDecisionError";
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
  decision: KycDecision;
  reason?: string;
  actorUserId: string;
}): Promise<void> {
  const row = await findUserById(input.userId);
  if (!row) {
    throw new InvalidKycDecisionError();
  }

  if (!canAdminDecideKyc(row.kycStatus, input.decision)) {
    throw new InvalidKycDecisionError();
  }

  const manual = input.decision === "verified" && row.kycStatus !== "pending";

  await updateKyc(input.userId, {
    kycStatus: input.decision,
    kycVerifiedAt: input.decision === "verified" ? Date.now() : null,
    kycRejectionReason: input.decision === "rejected" ? (input.reason ?? null) : null,
  });

  const summary =
    input.decision === "verified"
      ? manual
        ? "تایید دستی احراز هویت کاربر"
        : "تایید احراز هویت کاربر"
      : input.decision === "none"
        ? "لغو احراز هویت کاربر"
        : `رد احراز هویت کاربر: ${input.reason ?? "بدون توضیح"}`;

  await recordAudit({
    actorUserId: input.actorUserId,
    action: input.decision === "none" ? "kyc.revoked" : `kyc.${input.decision}`,
    entityType: "user",
    entityId: input.userId,
    summary,
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
    summary: input.status === "suspended" ? "مسدود کردن حساب کاربر" : "فعال‌سازی حساب کاربر",
  });
}

export class LastSuperAdminError extends Error {
  constructor() {
    super("آخرین مدیر ارشد را نمی‌توان به نقش دیگر برد.");
    this.name = "LastSuperAdminError";
  }
}

export async function setUserRole(input: {
  userId: string;
  role: string;
  grant: boolean;
  actorUserId: string;
}): Promise<void> {
  if (input.grant) {
    await assertAssignableRoleSlug(input.role);
    await grantRole(input.userId, input.role, input.actorUserId);
  } else {
    if (input.role === "super_admin") {
      const count = await countUsersWithRoleSlug("super_admin");
      if (count <= 1) throw new LastSuperAdminError();
    }
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

export async function assignUserAccess(input: {
  userId: string;
  role: string;
  actorUserId: string;
}): Promise<void> {
  await assertAssignableRoleSlug(input.role);

  const current = await findRolesForUser(input.userId);
  if (current.includes("super_admin") && input.role !== "super_admin") {
    const count = await countUsersWithRoleSlug("super_admin");
    if (count <= 1) throw new LastSuperAdminError();
  }

  const roles = rolesForAssignedRole(input.role);
  await replaceRolesForUser(input.userId, roles, input.actorUserId);

  const staffRoles = await listAssignableStaffRoles();

  await recordAudit({
    actorUserId: input.actorUserId,
    action: "role.assigned",
    entityType: "user",
    entityId: input.userId,
    summary: `تعیین نقش ${labelForAssignedRole(input.role, staffRoles)}`,
    meta: { role: input.role },
  });
}

export async function getRolesForUser(userId: string): Promise<string[]> {
  return findRolesForUser(userId);
}

export class UserDeleteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserDeleteError";
  }
}

/** حذف فیزیکی حساب؛ فقط وقتی ردپای مالی و گنجینه وجود ندارد. */
export async function deleteUserAccount(userId: string, actorUserId: string): Promise<void> {
  const row = await findUserById(userId);
  if (!row) {
    throw new UserDeleteError("کاربر پیدا نشد.");
  }

  await revokeAllSessions(userId);
  await deleteUserById(userId);

  await recordAudit({
    actorUserId,
    action: "user.deleted",
    entityType: "user",
    entityId: userId,
    summary: "حذف حساب کاربر",
  });
}
