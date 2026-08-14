import "server-only";

import type * as schema from "./schema";

/**
 * تایپ‌های استنتاج‌شده از اسکیما.
 *
 * `Row` شکل داده خوانده‌شده و `NewRow` شکل داده ورودی برای درج است.
 * هرگز این تایپ‌ها را دستی ننویسید؛ همیشه از اسکیما استنتاج کنید تا با
 * تغییر جدول، خطاهای کامپایل جای درست را نشان دهند.
 */

type Table = { $inferSelect: unknown; $inferInsert: unknown };

export type Row<T extends Table> = T["$inferSelect"];
export type NewRow<T extends Table> = T["$inferInsert"];

// --- هویت ---
export type UserRow = Row<typeof schema.users>;
export type NewUserRow = NewRow<typeof schema.users>;
export type UserRoleRow = Row<typeof schema.userRoles>;
export type StaffRoleRow = Row<typeof schema.staffRoles>;
export type StaffRoleGrantRow = Row<typeof schema.staffRoleGrants>;
export type SessionRow = Row<typeof schema.sessions>;
export type OtpCodeRow = Row<typeof schema.otpCodes>;
export type AuditLogRow = Row<typeof schema.auditLogs>;

// --- کودک ---
export type ChildRow = Row<typeof schema.children>;
export type NewChildRow = NewRow<typeof schema.children>;
export type GuardianshipRow = Row<typeof schema.guardianships>;
export type ChildTimelineEventRow = Row<typeof schema.childTimelineEvents>;

// --- گنجینه ---
export type TreasureRow = Row<typeof schema.treasures>;
export type NewTreasureRow = NewRow<typeof schema.treasures>;
export type GoldLedgerEntryRow = Row<typeof schema.goldLedgerEntries>;
export type NewGoldLedgerEntryRow = NewRow<typeof schema.goldLedgerEntries>;
export type TreasureGoalRow = Row<typeof schema.treasureGoals>;
export type TreasureMilestoneRow = Row<typeof schema.treasureMilestones>;

// --- هدیه ---
export type GiftLinkRow = Row<typeof schema.giftLinks>;
export type NewGiftLinkRow = NewRow<typeof schema.giftLinks>;
export type ContributionRow = Row<typeof schema.contributions>;
export type NewContributionRow = NewRow<typeof schema.contributions>;
export type GiftCardRow = Row<typeof schema.giftCards>;

// --- کاتالوگ ---
export type CategoryRow = Row<typeof schema.categories>;
export type OccasionRow = Row<typeof schema.occasions>;
export type ProductRow = Row<typeof schema.products>;
export type NewProductRow = NewRow<typeof schema.products>;
export type ProductVariantRow = Row<typeof schema.productVariants>;
export type NewProductVariantRow = NewRow<typeof schema.productVariants>;
export type ProductMediaRow = Row<typeof schema.productMedia>;
export type PersonalizationRow = Row<typeof schema.personalizations>;
export type NewPersonalizationRow = NewRow<typeof schema.personalizations>;

// --- قیمت ---
export type GoldPriceRow = Row<typeof schema.goldPrices>;
export type NewGoldPriceRow = NewRow<typeof schema.goldPrices>;

// --- سفارش ---
export type CartRow = Row<typeof schema.carts>;
export type CartItemRow = Row<typeof schema.cartItems>;
export type OrderRow = Row<typeof schema.orders>;
export type NewOrderRow = NewRow<typeof schema.orders>;
export type OrderItemRow = Row<typeof schema.orderItems>;
export type NewOrderItemRow = NewRow<typeof schema.orderItems>;
export type OrderStatusHistoryRow = Row<typeof schema.orderStatusHistory>;
export type ShipmentRow = Row<typeof schema.shipments>;

// --- پرداخت ---
export type PaymentRow = Row<typeof schema.payments>;
export type NewPaymentRow = NewRow<typeof schema.payments>;
export type CardTransferReceiptRow = Row<typeof schema.cardTransferReceipts>;
export type NewCardTransferReceiptRow = NewRow<typeof schema.cardTransferReceipts>;
export type BankAccountRow = Row<typeof schema.bankAccounts>;

// --- فایل و اعلان ---
export type MediaFileRow = Row<typeof schema.mediaFiles>;
export type NewMediaFileRow = NewRow<typeof schema.mediaFiles>;
export type NotificationRow = Row<typeof schema.notifications>;
export type SmsMessageRow = Row<typeof schema.smsMessages>;

// --- محتوا ---
export type SettingRow = Row<typeof schema.settings>;
export type ContentPageRow = Row<typeof schema.contentPages>;
export type FaqRow = Row<typeof schema.faqs>;
