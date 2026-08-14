/**
 * مجموعه مقادیر ثابت دامنه.
 *
 * چرا اینجا و نه در ماژول‌ها؟ چون اسکیمای دیتابیس (لایه server) به این مقادیر نیاز دارد
 * و طبق قوانین معماری، server نمی‌تواند از modules چیزی import کند. ماژول‌ها این
 * تایپ‌ها را از طریق index.ts خودشان دوباره صادر می‌کنند.
 *
 * از union رشته‌ای به‌جای enum استفاده می‌کنیم چون با SQLite و Zod بهتر کار می‌کند.
 */

// ------------------------------------------------------------------
// هویت و دسترسی
// ------------------------------------------------------------------

export const USER_ROLES = [
  "super_admin",
  "finance",
  "order_manager",
  "content_manager",
  "customer_support",
  "fulfillment",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** برچسب فارسی نقش‌ها برای نمایش در پنل. */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "مدیر ارشد",
  finance: "مالی",
  order_manager: "مدیر سفارش‌ها",
  content_manager: "مدیر محتوا",
  customer_support: "پشتیبانی مشتریان",
  fulfillment: "آماده‌سازی و ارسال",
};

/** slug نقش کارمندی؛ سیستمی یا سفارشی. */
export type RoleSlug = string;

export const ACCESS_SECTIONS = [
  "orders",
  "payments",
  "users",
  "children",
  "treasures",
  "catalog",
  "gold_price",
  "content",
  "settings",
  "reports",
  "sms",
] as const;
export type AccessSection = (typeof ACCESS_SECTIONS)[number];

export const ACCESS_SECTION_LABELS: Record<AccessSection, string> = {
  orders: "سفارش و ارسال",
  payments: "پرداخت",
  users: "کاربران",
  children: "کودکان",
  treasures: "گنجینه و کارت هدیه",
  catalog: "محصولات",
  gold_price: "قیمت طلا",
  content: "محتوا",
  settings: "تنظیمات",
  reports: "گزارش‌ها",
  sms: "پیامک و اعلان",
};

export const PANEL_ACCESS_LEVELS = ["none", "read", "write", "full"] as const;
export type PanelAccessLevel = (typeof PANEL_ACCESS_LEVELS)[number];

export const PANEL_ACCESS_LEVEL_LABELS: Record<PanelAccessLevel, string> = {
  none: "عدم دسترسی",
  read: "فقط خواندن",
  write: "ویرایش",
  full: "دسترسی کامل",
};

export const USER_STATUSES = ["active", "suspended"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: "فعال",
  suspended: "مسدود",
};

export const KYC_STATUSES = ["none", "pending", "verified", "rejected"] as const;
export type KycStatus = (typeof KYC_STATUSES)[number];

export const KYC_STATUS_LABELS: Record<KycStatus, string> = {
  none: "انجام‌نشده",
  pending: "در انتظار بررسی",
  verified: "تاییدشده",
  rejected: "ردشده",
};

export const OTP_PURPOSES = ["login", "phone_change"] as const;
export type OtpPurpose = (typeof OTP_PURPOSES)[number];

// ------------------------------------------------------------------
// کودک
// ------------------------------------------------------------------

export const GUARDIAN_RELATIONS = [
  "mother",
  "father",
  "grandmother",
  "grandfather",
  "aunt",
  "uncle",
  "sibling",
  "family_friend",
  "other",
] as const;
export type GuardianRelation = (typeof GUARDIAN_RELATIONS)[number];

export const GUARDIAN_RELATION_LABELS: Record<GuardianRelation, string> = {
  mother: "مادر",
  father: "پدر",
  grandmother: "مادربزرگ",
  grandfather: "پدربزرگ",
  aunt: "خاله یا عمه",
  uncle: "دایی یا عمو",
  sibling: "خواهر یا برادر",
  family_friend: "دوست خانوادگی",
  other: "سایر",
};

export const ACCESS_LEVELS = ["owner", "editor", "viewer"] as const;
export type AccessLevel = (typeof ACCESS_LEVELS)[number];

export const CHILD_GENDERS = ["girl", "boy", "unspecified"] as const;
export type ChildGender = (typeof CHILD_GENDERS)[number];

export const CHILD_GENDER_LABELS: Record<ChildGender, string> = {
  girl: "دختر",
  boy: "پسر",
  unspecified: "نامشخص",
};

// ------------------------------------------------------------------
// گنجینه و دفتر کل
// ------------------------------------------------------------------

export const TREASURE_KINDS = ["personal", "event"] as const;
export type TreasureKind = (typeof TREASURE_KINDS)[number];

export const TREASURE_STATUSES = ["active", "closed", "archived"] as const;
export type TreasureStatus = (typeof TREASURE_STATUSES)[number];

export const TREASURE_STATUS_LABELS: Record<TreasureStatus, string> = {
  active: "فعال",
  closed: "بسته‌شده",
  archived: "بایگانی‌شده",
};

export const TREASURE_VISIBILITIES = ["private", "link"] as const;
export type TreasureVisibility = (typeof TREASURE_VISIBILITIES)[number];

export const LEDGER_DIRECTIONS = ["in", "out"] as const;
export type LedgerDirection = (typeof LEDGER_DIRECTIONS)[number];

export const LEDGER_SOURCES = [
  "purchase",
  "contribution",
  "adjustment",
  "redemption",
  "correction",
] as const;
export type LedgerSource = (typeof LEDGER_SOURCES)[number];

export const LEDGER_SOURCE_LABELS: Record<LedgerSource, string> = {
  purchase: "خرید",
  contribution: "هدیه",
  adjustment: "تعدیل",
  redemption: "تحویل فیزیکی",
  correction: "اصلاح",
};

export const GOAL_STATUSES = ["active", "achieved", "cancelled"] as const;
export type GoalStatus = (typeof GOAL_STATUSES)[number];

// ------------------------------------------------------------------
// هدیه
// ------------------------------------------------------------------

export const GIFT_LINK_STATUSES = ["active", "paused", "expired", "closed"] as const;
export type GiftLinkStatus = (typeof GIFT_LINK_STATUSES)[number];

export const GIFT_LINK_STATUS_LABELS: Record<GiftLinkStatus, string> = {
  active: "فعال",
  paused: "متوقف‌شده",
  expired: "منقضی‌شده",
  closed: "بسته‌شده",
};

export const CONTRIBUTION_STATUSES = [
  "draft",
  "awaiting_payment",
  "confirmed",
  "rejected",
  "cancelled",
] as const;
export type ContributionStatus = (typeof CONTRIBUTION_STATUSES)[number];

export const CONTRIBUTION_STATUS_LABELS: Record<ContributionStatus, string> = {
  draft: "پیش‌نویس",
  awaiting_payment: "در انتظار پرداخت",
  confirmed: "تاییدشده",
  rejected: "ردشده",
  cancelled: "لغوشده",
};

export const GIFT_CARD_STATUSES = [
  "unassigned",
  "assigned",
  "printed",
  "redeemed",
  "void",
] as const;
export type GiftCardStatus = (typeof GIFT_CARD_STATUSES)[number];

export const GIFT_CARD_STATUS_LABELS: Record<GiftCardStatus, string> = {
  unassigned: "آزاد",
  assigned: "منسوب",
  printed: "چاپ‌شده",
  redeemed: "مصرف‌شده",
  void: "باطل",
};

// ------------------------------------------------------------------
// کاتالوگ
// ------------------------------------------------------------------

export const PRODUCT_KINDS = ["jewelry", "coin", "bar", "custom"] as const;
export type ProductKind = (typeof PRODUCT_KINDS)[number];

export const PRODUCT_KIND_LABELS: Record<ProductKind, string> = {
  jewelry: "زیورآلات",
  coin: "سکه",
  bar: "شمش",
  custom: "محصول اختصاصی",
};

/** سکه و شمش محصول سرمایه‌ای‌اند و فرمول قیمت‌گذاری متفاوتی دارند. */
export const INVESTMENT_PRODUCT_KINDS: readonly ProductKind[] = ["coin", "bar"];

export const BRAND_LINES = ["standard", "signature"] as const;
export type BrandLine = (typeof BRAND_LINES)[number];

export const PRODUCT_STATUSES = ["draft", "active", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  draft: "پیش‌نویس",
  active: "فعال",
  archived: "بایگانی‌شده",
};

export const GOLD_KARATS = [18, 24] as const;
export type GoldKarat = (typeof GOLD_KARATS)[number];

// ------------------------------------------------------------------
// قیمت
// ------------------------------------------------------------------

export const GOLD_PRICE_SOURCES = ["manual", "external"] as const;
export type GoldPriceSource = (typeof GOLD_PRICE_SOURCES)[number];

// ------------------------------------------------------------------
// سفارش
// ------------------------------------------------------------------

export const ORDER_STATUSES = [
  "created",
  "payment_pending",
  "paid",
  "processing",
  "personalization",
  "quality_check",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "refund_pending",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  created: "ثبت‌شده",
  payment_pending: "در انتظار پرداخت",
  paid: "پرداخت‌شده",
  processing: "در حال آماده‌سازی",
  personalization: "در حال شخصی‌سازی",
  quality_check: "کنترل کیفیت",
  packed: "بسته‌بندی‌شده",
  shipped: "ارسال‌شده",
  delivered: "تحویل‌شده",
  cancelled: "لغوشده",
  refund_pending: "در انتظار بازگشت وجه",
  refunded: "بازگشت وجه انجام‌شده",
};

export const CART_STATUSES = ["open", "converted", "abandoned"] as const;
export type CartStatus = (typeof CART_STATUSES)[number];

export const SHIPMENT_STATUSES = ["pending", "shipped", "delivered", "returned"] as const;
export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

// ------------------------------------------------------------------
// پرداخت
// ------------------------------------------------------------------

export const PAYMENT_PROVIDERS = ["card_transfer", "online_gateway"] as const;
export type PaymentProviderKey = (typeof PAYMENT_PROVIDERS)[number];

export const PAYMENT_PROVIDER_LABELS: Record<PaymentProviderKey, string> = {
  card_transfer: "کارت به کارت",
  online_gateway: "درگاه پرداخت آنلاین",
};

export const PAYMENT_PURPOSES = ["order", "contribution"] as const;
export type PaymentPurpose = (typeof PAYMENT_PURPOSES)[number];

export const PAYMENT_STATUSES = [
  "awaiting_transfer",
  "receipt_submitted",
  "under_review",
  "confirmed",
  "rejected",
  "expired",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  awaiting_transfer: "در انتظار واریز",
  receipt_submitted: "رسید ارسال شد",
  under_review: "در حال بررسی",
  confirmed: "تاییدشده",
  rejected: "ردشده",
  expired: "منقضی‌شده",
};

// ------------------------------------------------------------------
// فایل و اعلان
// ------------------------------------------------------------------

export const FILE_VISIBILITIES = ["public", "private"] as const;
export type FileVisibility = (typeof FILE_VISIBILITIES)[number];

export const NOTIFICATION_KINDS = [
  "order_placed",
  "payment_confirmed",
  "payment_rejected",
  "payment_review_needed",
  "gift_received",
  "milestone_reached",
  "order_shipped",
  "order_delivered",
  "system",
] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export const SMS_STATUSES = ["queued", "sent", "failed"] as const;
export type SmsStatus = (typeof SMS_STATUSES)[number];

export const SMS_PROVIDERS = ["console", "kavenegar"] as const;
export type SmsProviderKey = (typeof SMS_PROVIDERS)[number];

// ------------------------------------------------------------------
// محتوا
// ------------------------------------------------------------------

export const CONTENT_STATUSES = ["draft", "published"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];
