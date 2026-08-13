/**
 * ماژول شخصی‌سازی — API عمومی.
 *
 * مسئول: داده‌های شخصی‌سازی محصول و پیش‌نمایش حکاکی.
 * مستندات: docs/03-modules/personalization.md
 */

export type { Personalization, PersonalizationInput } from "./domain/types";

export {
  validateEngravingText,
  estimateEngravingFit,
  detectScript,
  ENGRAVING_MESSAGES,
} from "./domain/engraving";

export {
  getPersonalizationById,
  createPersonalization,
  updatePersonalization,
  lock as lockPersonalization,
  EngravingError,
  PersonalizationLockedError,
} from "./service/personalization.service";

export { EngravingPreview } from "./ui/engraving-preview";
