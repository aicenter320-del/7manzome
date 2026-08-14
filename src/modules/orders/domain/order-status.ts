import { ORDER_STATUSES, type OrderStatus } from "@/shared/types/enums";

/**
 * ماشین حالت سفارش.
 *
 * گذارها به‌صورت داده تعریف شده‌اند تا هم قابل تست باشند و هم در UI برای
 * ساخت دکمه‌های مجاز استفاده شوند. نمودار در docs/02-domain/state-machines.md
 *
 * `created → paid` برای تسویه پرداخت است؛ اگر تایید خیلی سریع برسد، از
 * `payment_pending` رد نمی‌شویم ولی پرش مستقیم از ثبت به پرداخت‌شده مجاز است.
 *
 * برگشت در مسیر آماده‌سازی تا پس از تحویل، برای اصلاح اشتباه کارمند است.
 * از `cancelled` / `refunded` برگشت نیست. بازگشت به `payment_pending`
 * هم نیست چون طلا وارد دفتر کل شده.
 */

export const TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  created: ["payment_pending", "paid", "cancelled"],
  payment_pending: ["paid", "cancelled"],
  paid: ["processing", "refund_pending"],
  processing: ["personalization", "quality_check", "paid", "refund_pending"],
  personalization: ["quality_check", "processing"],
  quality_check: ["packed", "processing", "personalization"],
  packed: ["shipped", "quality_check"],
  shipped: ["delivered", "packed"],
  delivered: ["shipped"],
  cancelled: [],
  refund_pending: ["refunded"],
  refunded: [],
};

/** وضعیت‌هایی که مشتری می‌تواند خودش لغو کند. */
export const CUSTOMER_CANCELLABLE_STATUSES: readonly OrderStatus[] = [
  "created",
  "payment_pending",
];

/** وضعیت‌هایی که پرداخت تایید شده و طلا/فروش باید در گزارش‌ها شمرده شود. */
export const COUNTED_GOLD_STATUSES: readonly OrderStatus[] = [
  "paid",
  "processing",
  "personalization",
  "quality_check",
  "packed",
  "shipped",
  "delivered",
];

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function nextStatuses(from: OrderStatus): readonly OrderStatus[] {
  return TRANSITIONS[from];
}

export function isFinalStatus(status: OrderStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

export function canCustomerCancel(status: OrderStatus): boolean {
  return CUSTOMER_CANCELLABLE_STATUSES.includes(status);
}

/** سفارش‌هایی که دیگر مسیر جاری مشتری نیستند. */
const SETTLED_CUSTOMER_STATUSES: readonly OrderStatus[] = [
  "delivered",
  "cancelled",
  "refunded",
];

/**
 * وضعیت نمایشی مشتری: اگر سفارش جاری دارد همان است؛
 * وگرنه آخرین سفارش ثبت‌شده.
 */
export function latestCustomerOrderStatus(
  orders: readonly { status: OrderStatus; createdAt: number }[],
): OrderStatus | null {
  if (orders.length === 0) return null;

  const newestFirst = [...orders].sort((left, right) => right.createdAt - left.createdAt);
  const current = newestFirst.find(
    (order) => !SETTLED_CUSTOMER_STATUSES.includes(order.status),
  );
  return current?.status ?? newestFirst[0]?.status ?? null;
}

/**
 * آیا این گذار فقط برای کارمند است؟
 * انصراف مشتری از وضعیت‌های قابل‌لغو، و گذار سیستمی به پرداخت، استثنا هستند.
 */
export function isStaffOnlyTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (!canTransition(from, to)) return false;
  if (to === "cancelled" && canCustomerCancel(from)) return false;
  if (from === "created" && to === "payment_pending") return false;
  return true;
}

/** ساخت شماره قابل‌نمایش سفارش: HM-1404-000123 */
export function buildOrderNumber(jalaliYear: number, sequence: number): string {
  return `HM-${jalaliYear}-${String(sequence).padStart(6, "0")}`;
}

export { ORDER_STATUSES };
