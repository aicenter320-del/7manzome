/**
 * ماژول هویت — API عمومی.
 *
 * مسئول: ورود با کد یک‌بارمصرف، پروفایل، نقش‌ها و احراز هویت کامل.
 * مستندات: docs/03-modules/identity.md
 */

export type { PublicUser, AdminUserDetail, OtpRequestResult } from "./domain/types";
export {
  ASSIGNABLE_ROLE_LABELS,
  ASSIGNABLE_ROLES,
  assignedRoleFromRoles,
} from "./domain/user-access";
export type { AssignableRole } from "./domain/user-access";
export {
  KYC_DECISION_LABELS,
  nextKycDecisions,
  canAdminDecideKyc,
} from "./domain/kyc-status";
export type { KycDecision } from "./domain/kyc-status";

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
  assignUserAccess,
  KycConflictError,
  InvalidKycDecisionError,
  deleteUserAccount,
  UserDeleteError,
} from "./service/user.service";

export {
  requestOtpSchema,
  verifyOtpSchema,
  updateProfileSchema,
  submitKycSchema,
  assignUserAccessSchema,
  updateAdminUserProfileSchema,
} from "./schema/identity.schema";

export { requestLoginCode, verifyLoginCode, logout } from "./actions/auth.actions";

export {
  updateProfile,
  submitKyc,
  decideKyc,
  changeUserStatus,
  changeUserRole,
  assignUserAccessAction,
  updateAdminUserProfile,
} from "./actions/user.actions";

export { LoginForm } from "./ui/login-form";
export { KycForm } from "./ui/kyc-form";
export { KycStatusBadge } from "./ui/kyc-status-badge";
export { KycDecisionSelect } from "./ui/kyc-decision-select";
export { AccountStatusBadge, UserAccountStatusSelect } from "./ui/user-account-status-select";
export { ProfileForm } from "./ui/profile-form";
export { AdminUserProfileForm } from "./ui/admin-user-profile-form";
export { UserRoleSelect } from "./ui/user-access-selects";
