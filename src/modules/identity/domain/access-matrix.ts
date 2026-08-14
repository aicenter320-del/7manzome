/**
 * ماتریس دسترسی پنل. پیاده‌سازی در shared است تا rbac هم بتواند بخواند.
 */
export {
  SYSTEM_ROLE_GRANTS,
  SYSTEM_ROLE_TITLES,
  completeGrants,
  fallbackPermissionsForRoleSlug,
  grantsForSystemRole,
  isAccessSection,
  isLockedRoleSlug,
  isPanelAccessLevel,
  isSystemRoleSlug,
  permissionsForGrant,
  permissionsForGrants,
  systemStaffRoleSeedData,
} from "@/shared/lib/access-matrix";
export type { SectionGrant, SystemStaffRoleSeed } from "@/shared/lib/access-matrix";
