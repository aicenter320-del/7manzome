/**
 * ماژول هویت — API عمومی.
 *
 * مسئول: ورود با کد یک‌بارمصرف، پروفایل، نقش‌ها و احراز هویت کامل.
 * مستندات: docs/03-modules/identity.md
 */

export type { PublicUser, AdminUserDetail, OtpRequestResult } from "./domain/types";
export {
  CUSTOMER_ROLE_SLUG,
  assignedRoleFromRoles,
  labelForAssignedRole,
} from "./domain/user-access";
export type { StaffRoleOption } from "./domain/user-access";
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
  LastSuperAdminError,
} from "./service/user.service";

export {
  listStaffRoles,
  getStaffRole,
  listAssignableStaffRoles,
  createStaffRole,
  saveStaffRole,
  removeStaffRole,
  StaffRoleError,
} from "./service/staff-role.service";
export type { StaffRoleView } from "./service/staff-role.service";

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

export {
  createStaffRoleAction,
  updateStaffRoleAction,
  deleteStaffRoleAction,
} from "./actions/staff-role.actions";

export { LoginForm } from "./ui/login-form";
export { KycForm } from "./ui/kyc-form";
export { KycStatusBadge } from "./ui/kyc-status-badge";
export { KycDecisionSelect } from "./ui/kyc-decision-select";
export { AccountStatusBadge, UserAccountStatusSelect } from "./ui/user-account-status-select";
export { ProfileForm } from "./ui/profile-form";
export { AdminUserProfileForm } from "./ui/admin-user-profile-form";
export { UserRoleSelect } from "./ui/user-access-selects";
export { StaffRoleForm } from "./ui/staff-role-form";
export { DeleteStaffRoleButton } from "./ui/delete-staff-role-button";
