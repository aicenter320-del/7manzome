import { isLinkAccepting } from "@/modules/gifting/domain/gift-link";
import type { GiftLinkPublicView } from "@/modules/gifting/domain/types";

/** زمان جاری بیرون از رندر کامپوننت خوانده می‌شود تا قانون خلوص React نقض نشود. */
export function isGiftViewAccepting(view: Pick<GiftLinkPublicView, "status" | "expiresAt">): boolean {
  return isLinkAccepting(view.status, view.expiresAt, Date.now());
}
