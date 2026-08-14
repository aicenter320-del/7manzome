import type { KycStatus, UserStatus } from "@/shared/types/enums";

/** نمایه عمومی کاربر؛ هیچ داده حساسی ندارد. */
export interface PublicUser {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  status: UserStatus;
  kycStatus: KycStatus;
  roles: string[];
  createdAt: number;
}

/** جزئیات کاربر برای پنل ادمین؛ شامل دادهٔ هویتی حساس. */
export interface AdminUserDetail extends PublicUser {
  email: string | null;
  nationalId: string | null;
  birthDateAt: number | null;
  kycVerifiedAt: number | null;
  kycRejectionReason: string | null;
}

/** نتیجه درخواست کد یک‌بارمصرف. */
export interface OtpRequestResult {
  /** ثانیه باقی‌مانده تا امکان درخواست مجدد. */
  retryAfterSeconds: number;
  expiresInSeconds: number;
  /** فقط در محیط توسعه پر می‌شود (DEV_EXPOSE_OTP). */
  devCode?: string;
}
