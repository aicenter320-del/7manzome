import type { KycStatus, UserRole, UserStatus } from "@/shared/types/enums";

/** نمایه عمومی کاربر؛ هیچ داده حساسی ندارد. */
export interface PublicUser {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  status: UserStatus;
  kycStatus: KycStatus;
  roles: UserRole[];
  createdAt: number;
}

/** نتیجه درخواست کد یک‌بارمصرف. */
export interface OtpRequestResult {
  /** ثانیه باقی‌مانده تا امکان درخواست مجدد. */
  retryAfterSeconds: number;
  expiresInSeconds: number;
  /** فقط در محیط توسعه پر می‌شود (DEV_EXPOSE_OTP). */
  devCode?: string;
}
