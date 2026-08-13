import type {
  ContributionStatus,
  GiftCardStatus,
  GiftLinkStatus,
  GoldKarat,
} from "@/shared/types/enums";

export interface GiftLink {
  id: string;
  treasureId: string;
  token: string;
  title: string;
  message: string | null;
  suggestedAmountsRial: number[] | null;
  targetMg: number | null;
  status: GiftLinkStatus;
  expiresAt: number | null;
  viewCount: number;
  createdByUserId: string;
  createdAt: number;
}

/** پیام یادگاری قابل‌نمایش در صفحه عمومی؛ بدون داده تماس یا شناسه. */
export interface PublicKeepsake {
  contributorDisplayName: string;
  message: string;
}

/**
 * نمای عمومی لینک هدیه.
 *
 * فقط همین فیلدها مجازند. نام خانوادگی، تلفن، شناسه داخلی،
 * آدرس و کد ملی هرگز اینجا نمی‌آیند.
 */
export interface GiftLinkPublicView {
  token: string;
  title: string;
  message: string | null;
  childFirstName: string;
  childAgeLabel: string;
  progressPercent: number;
  balanceMg: number;
  goalTargetMg: number | null;
  suggestedAmountsRial: number[];
  status: GiftLinkStatus;
  expiresAt: number | null;
  keepsakes: PublicKeepsake[];
}

export interface Contribution {
  id: string;
  treasureId: string;
  giftLinkId: string | null;
  contributorUserId: string | null;
  contributorName: string;
  contributorPhone: string | null;
  relationLabel: string | null;
  amountRial: number;
  goldMg: number | null;
  karat: GoldKarat | null;
  goldPricePerGramRial: number | null;
  status: ContributionStatus;
  keepsakeMessage: string | null;
  isAnonymous: boolean;
  confirmedAt: number | null;
  createdAt: number;
}

export interface GiftCard {
  id: string;
  code: string;
  design: string;
  treasureId: string | null;
  contributionId: string | null;
  status: GiftCardStatus;
  note: string | null;
  assignedAt: number | null;
  printedAt: number | null;
  redeemedAt: number | null;
  createdByUserId: string | null;
  createdAt: number;
}

export interface StartContributionInput {
  token: string;
  contributorName: string;
  contributorPhone?: string;
  relationLabel?: string;
  amountRial: number;
  keepsakeMessage?: string;
  isAnonymous: boolean;
  contributorUserId?: string | null;
}
