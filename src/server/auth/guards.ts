import "server-only";

import { forbidden, redirect, unauthorized } from "next/navigation";

import type { UserRole } from "@/shared/types/enums";

import { hasPermission, hasRole, isStaff, type Permission } from "./rbac";
import { getSessionUser, type SessionUser } from "./session";

/**
 * نگهبان‌های آماده برای صفحات و لایوت‌ها.
 *
 * ⚠️ استفاده از این‌ها در صفحه **کافی نیست**. هر Server Action هم باید
 * دسترسی را مستقل بررسی کند، چون یک endpoint قابل فراخوانی مستقیم است.
 * برای اکشن‌ها از createAction در server/actions/action-kit.ts استفاده کنید.
 */

/** کاربر واردشده لازم است، وگرنه به صفحه ورود هدایت می‌شود. */
export async function requireUser(returnTo?: string): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    const target = returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : "/login";
    redirect(target);
  }

  return user;
}

/** احراز هویت کامل لازم است. */
export async function requireVerifiedUser(returnTo?: string): Promise<SessionUser> {
  const user = await requireUser(returnTo);

  if (user.kycStatus !== "verified") {
    redirect("/dashboard/profile?kyc=required");
  }

  return user;
}

/** دسترسی به پنل مدیریت؛ هر نقش کارمندی. */
export async function requireStaff(): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) unauthorized();
  if (!isStaff(user.roles)) forbidden();

  return user;
}

/** یکی از نقش‌های مشخص لازم است. */
export async function requireRole(allowed: readonly UserRole[]): Promise<SessionUser> {
  const user = await requireStaff();

  if (!hasRole(user.roles, allowed)) forbidden();

  return user;
}

/** مجوز مشخص لازم است. */
export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireStaff();

  if (!hasPermission(user.roles, permission)) forbidden();

  return user;
}

/** کاربر جاری، اگر وارد شده باشد؛ برای صفحاتی که هم مهمان و هم کاربر دارند. */
export async function optionalUser(): Promise<SessionUser | null> {
  return getSessionUser();
}
