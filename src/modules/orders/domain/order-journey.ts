import { ORDER_STATUSES, type OrderStatus } from "@/shared/types/enums";

/**
 * ایستگاه‌های نمایشی سفر سفارش برای پنل مدیریت.
 * وضعیت دامنه عوض نمی‌شود؛ فقط گروه‌بندی برای نقشه است.
 */
export const ORDER_JOURNEY_STATIONS = [
  { key: "awaiting_payment", label: "منتظر پرداخت", statuses: ["created", "payment_pending"] },
  { key: "paid", label: "تایید پول", statuses: ["paid"] },
  { key: "prep", label: "آماده‌سازی", statuses: ["processing"] },
  { key: "engrave", label: "حکاکی", statuses: ["personalization"] },
  { key: "qc", label: "کنترل کیفیت", statuses: ["quality_check"] },
  { key: "pack", label: "بسته‌بندی", statuses: ["packed"] },
  { key: "ship", label: "ارسال", statuses: ["shipped"] },
  { key: "done", label: "تحویل", statuses: ["delivered"] },
] as const;

export const ORDER_JOURNEY_CLOSED = {
  key: "closed",
  label: "بسته",
  statuses: ["cancelled", "refund_pending", "refunded"],
} as const;

export type OrderJourneyStationKey =
  | (typeof ORDER_JOURNEY_STATIONS)[number]["key"]
  | typeof ORDER_JOURNEY_CLOSED.key;

const STATUS_TO_STATION = new Map<OrderStatus, OrderJourneyStationKey>();

for (const station of ORDER_JOURNEY_STATIONS) {
  for (const status of station.statuses) {
    STATUS_TO_STATION.set(status, station.key);
  }
}
for (const status of ORDER_JOURNEY_CLOSED.statuses) {
  STATUS_TO_STATION.set(status, ORDER_JOURNEY_CLOSED.key);
}

export function journeyStationOf(status: OrderStatus): OrderJourneyStationKey {
  return STATUS_TO_STATION.get(status) ?? "closed";
}

export function isClosedJourneyStatus(status: OrderStatus): boolean {
  return journeyStationOf(status) === "closed";
}

/**
 * گام بعدی رو به جلو برای دکمهٔ «مرحله بعد».
 * تایید پول از صف پرداخت است، نه از سفارش.
 */
export function preferredForwardStatus(
  from: OrderStatus,
  hasPersonalization: boolean,
): OrderStatus | null {
  switch (from) {
    case "paid":
      return "processing";
    case "processing":
      return hasPersonalization ? "personalization" : "quality_check";
    case "personalization":
      return "quality_check";
    case "quality_check":
      return "packed";
    case "packed":
      return "shipped";
    case "shipped":
      return "delivered";
    case "refund_pending":
      return "refunded";
    default:
      return null;
  }
}

export function parseJourneyStation(
  value: string | undefined,
): OrderJourneyStationKey | undefined {
  if (!value) {
    return undefined;
  }
  if (value === ORDER_JOURNEY_CLOSED.key) {
    return ORDER_JOURNEY_CLOSED.key;
  }
  if (ORDER_JOURNEY_STATIONS.some((station) => station.key === value)) {
    return value as OrderJourneyStationKey;
  }
  return undefined;
}

export { ORDER_STATUSES };
