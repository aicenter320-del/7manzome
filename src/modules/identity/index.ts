/**
 * ماژول هویت — API عمومی.
 *
 * مسئول: ورود با کد یک‌بارمصرف، پروفایل، نقش‌ها و احراز هویت کامل.
 * مستندات: docs/03-modules/identity.md
 */

export type { PublicUser, OtpRequestResult } from "./domain/types";

export {
  OTP_CODE_LENGTH,
  OTP_TTL_MS,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_MS,
  canResend,
  secondsUntilResend,
} from "./domain/otp-policy";

export { requestOtp, verifyOtpAndLogin, OtpError } from "./service/auth.service";

export {
  getUserById,
  getUserByPhone,
  getUserDetailForAdmin,
  getRolesForUser,
  getUserCount,
  getCustomerSignupCount,
  listUsers,
  saveProfile,
  submitKycRequest,
  reviewKyc,
  setUserStatus,
  setUserRole,
  KycConflictError,
} from "./service/user.service";

export {
  requestOtpSchema,
  verifyOtpSchema,
  updateProfileSchema,
  submitKycSchema,
} from "./schema/identity.schema";

export { requestLoginCode, verifyLoginCode, logout } from "./actions/auth.actions";

export {
  updateProfile,
  submitKyc,
  decideKyc,
  changeUserStatus,
  changeUserRole,
} from "./actions/user.actions";

export { LoginForm } from "./ui/login-form";
export { KycForm } from "./ui/kyc-form";
export { ProfileForm } from "./ui/profile-form";
