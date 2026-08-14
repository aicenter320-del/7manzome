/**
 * ماژول کودکان — API عمومی.
 *
 * مسئول: پروفایل کودک، رابطه سرپرستی و تایم‌لاین زندگی کودک.
 * مستندات: docs/03-modules/children.md
 */

export type { Child, ChildSummary, Guardianship, TimelineEvent } from "./domain/types";

export {
  computeAgeInfo,
  validateBirthDate,
  matchesAgeRange,
  isBirthdayNear,
  upcomingBirthdayAge,
  buildDisplayName,
  MAX_CHILD_AGE_MONTHS,
} from "./domain/child-age";

export {
  assertChildAccess,
  getChildrenForUser,
  getChildById,
  getChildUnchecked,
  getChildCount,
  getGuardianships,
  getTimeline,
  createChild,
  editChild,
  editChildAsAdmin,
  archive,
  archiveAsAdmin,
  ChildAccessError,
  BirthDateError,
} from "./service/child.service";

export { createChildSchema, updateChildSchema, childIdSchema } from "./schema/child.schema";

export {
  createChildProfile,
  updateChildProfile,
  archiveChildProfile,
  restoreChildProfile,
  addChildGuardian,
  removeChildGuardian,
  addChildTimelineEvent,
  uploadChildAvatar,
} from "./actions/child.actions";

export { ChildAvatar } from "./ui/child-avatar";
export { ChildForm } from "./ui/child-form";
