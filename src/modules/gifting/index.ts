/**
 * ماژول هدیه — API عمومی.
 *
 * مسئول: لینک هدیه، مشارکت مهمان، پیام یادگاری و کارت هدیه فیزیکی.
 * ثبت طلا در دفتر کل با treasury و دریافت وجه با payments انجام می‌شود.
 *
 * ⚠️ payments این ماژول را import نمی‌کند. تسویه مشارکت با confirmContribution
 * از سمت ادمین صدا زده می‌شود تا دور وابستگی ساخته نشود.
 *
 * مستندات: docs/03-modules/gifting.md
 */

export type {
  GiftLink,
  GiftLinkPublicView,
  PublicKeepsake,
  Contribution,
  GiftCard,
  StartContributionInput,
} from "./domain/types";

export {
  isGiftTokenFormat,
  isLinkAccepting,
  validateContributionAmount,
  maskContributorName,
  buildGiftUrl,
  ANONYMOUS_DISPLAY_NAME,
} from "./domain/gift-link";

export {
  canTransition as canTransitionContribution,
  nextStatuses as nextContributionStatuses,
  canUpdateKeepsake,
} from "./domain/contribution-status";

export {
  createGiftLink,
  pauseGiftLink,
  resumeGiftLink,
  closeGiftLink,
  getGiftLinkByToken,
  getGiftLinksForTreasure,
  GiftLinkError,
  GiftLinkInactiveError,
} from "./service/gifting.service";

export {
  startContribution,
  confirmContribution,
  markContributionRejected,
  cancelContribution,
  saveKeepsake,
  listContributionsForTreasure,
  getContributionsForTreasure,
  countConfirmedContributionsSince,
  ContributionError,
} from "./service/contribution.service";

export {
  createGiftCards,
  assignGiftCard,
  markPrinted,
  redeemGiftCard,
  listGiftCards,
  GiftCardError,
} from "./service/gift-card.service";

export {
  createGiftLinkSchema,
  startContributionSchema,
  saveKeepsakeSchema,
  createGiftCardsSchema,
  redeemGiftCardSchema,
} from "./schema/gifting.schema";

export {
  createGiftLinkAction,
  pauseGiftLinkAction,
  resumeGiftLinkAction,
  closeGiftLinkAction,
  startContributionAction,
  saveKeepsakeAction,
  createGiftCardsAction,
  redeemGiftCardAction,
} from "./actions/gifting.actions";

export { GiftProgress } from "./ui/gift-progress";
export { ContributionForm } from "./ui/contribution-form";
export { KeepsakeList } from "./ui/keepsake-list";
export { GiftShareBar } from "./ui/gift-share-bar";
