import { fromJalali, startOfJalaliMonth, startOfTehranDay, toJalali } from "@/shared/lib/jalali";
import { mulDiv } from "@/shared/lib/math";
import type { OrderStatus } from "@/shared/types/enums";

/**
 * قواعد خالص داشبورد مالک: درصد تغییر، سلامت، هشدار و بازه روند.
 */

export const HEALTH_LEVELS = ["healthy", "attention", "critical"] as const;
export type HealthLevel = (typeof HEALTH_LEVELS)[number];

export const HEALTH_LABELS: Record<HealthLevel, string> = {
  healthy: "سالم",
  attention: "نیازمند توجه",
  critical: "بحرانی",
};

export const DASHBOARD_RANGES = ["today", "7d", "30d", "90d", "year"] as const;
export type DashboardRange = (typeof DASHBOARD_RANGES)[number];

export const DASHBOARD_RANGE_LABELS: Record<DashboardRange, string> = {
  today: "امروز",
  "7d": "۷ روز اخیر",
  "30d": "۳۰ روز اخیر",
  "90d": "۳ ماه اخیر",
  year: "سال جاری",
};

/** افت ۲۰٪ نسبت به دوره قبل = نیازمند توجه. */
export const DROP_ATTENTION_BP = -2_000;
/** افت ۵۰٪ = بحرانی برای حوزه فروش/سود/رشد. */
export const DROP_CRITICAL_BP = -5_000;

const DAY_MS = 86_400_000;

export type AttentionSeverity = "critical" | "warning";

export interface AttentionItem {
  id: string;
  severity: AttentionSeverity;
  title: string;
  href: string;
  count?: number;
}

export interface HealthSignals {
  shopOpen: boolean;
  goldPriceAvailable: boolean;
  pendingReviewCount: number;
  stuckOrderCount: number;
  outOfStockCount: number;
  lowStockCount: number;
  rejectedPaymentCount: number;
  salesChangeBp: number | null;
  profitChangeBp: number | null;
}

/** درصد تغییر به‌صورت صدم درصد. بدون دوره قبل: null. هر دو صفر: ۰. */
export function percentChangeBp(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }

  return mulDiv(current - previous, 10_000, previous);
}

export function parseDashboardRange(value: string | undefined): DashboardRange {
  if (value && (DASHBOARD_RANGES as readonly string[]).includes(value)) {
    return value as DashboardRange;
  }

  return "30d";
}

export interface ResolvedRange {
  range: DashboardRange;
  fromAt: number;
  toAt: number;
  previousFromAt: number;
  previousToAt: number;
  grain: "day" | "month";
}

export function resolveDashboardRange(
  range: DashboardRange,
  nowMs: number = Date.now(),
): ResolvedRange {
  const todayStart = startOfTehranDay(nowMs);
  const toAt = nowMs;

  if (range === "today") {
    const fromAt = todayStart;
    return {
      range,
      fromAt,
      toAt,
      previousFromAt: fromAt - DAY_MS,
      previousToAt: fromAt,
      grain: "day",
    };
  }

  if (range === "year") {
    const { year } = toJalali(nowMs);
    const fromAt = fromJalali({ year, month: 1, day: 1 });
    const previousFromAt = fromJalali({ year: year - 1, month: 1, day: 1 });
    return {
      range,
      fromAt,
      toAt,
      previousFromAt,
      previousToAt: fromAt,
      grain: "month",
    };
  }

  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
  const fromAt = todayStart - (days - 1) * DAY_MS;
  const span = toAt - fromAt;

  return {
    range,
    fromAt,
    toAt,
    previousFromAt: fromAt - span,
    previousToAt: fromAt,
    grain: "day",
  };
}

export interface TimeBucket {
  startAt: number;
  endAt: number;
  label: string;
}

export function buildTimeBuckets(
  fromAt: number,
  toAt: number,
  grain: "day" | "month",
): TimeBucket[] {
  const buckets: TimeBucket[] = [];

  if (grain === "month") {
    let cursor = startOfJalaliMonth(fromAt);
    while (cursor < toAt) {
      const { year, month } = toJalali(cursor);
      const nextMonth = month === 12 ? fromJalali({ year: year + 1, month: 1, day: 1 }) : fromJalali({ year, month: month + 1, day: 1 });
      buckets.push({
        startAt: cursor,
        endAt: Math.min(nextMonth, toAt),
        label: `${year}/${String(month).padStart(2, "0")}`,
      });
      cursor = nextMonth;
    }
    return buckets;
  }

  let cursor = startOfTehranDay(fromAt);
  const last = startOfTehranDay(toAt);
  while (cursor <= last) {
    const { month, day } = toJalali(cursor);
    buckets.push({
      startAt: cursor,
      endAt: Math.min(cursor + DAY_MS, toAt),
      label: `${month}/${day}`,
    });
    cursor += DAY_MS;
  }

  return buckets;
}

export function classifyTrendHealth(changeBp: number | null): HealthLevel {
  if (changeBp === null) return "healthy";
  if (changeBp <= DROP_CRITICAL_BP) return "critical";
  if (changeBp <= DROP_ATTENTION_BP) return "attention";
  return "healthy";
}

export function classifyCountHealth(
  problemCount: number,
  attentionAt = 1,
  criticalAt = 5,
): HealthLevel {
  if (problemCount >= criticalAt) return "critical";
  if (problemCount >= attentionAt) return "attention";
  return "healthy";
}

export function worstHealth(levels: readonly HealthLevel[]): HealthLevel {
  if (levels.includes("critical")) return "critical";
  if (levels.includes("attention")) return "attention";
  return "healthy";
}

export function classifyOverallHealth(signals: HealthSignals): HealthLevel {
  return worstHealth([
    signals.shopOpen && signals.goldPriceAvailable ? "healthy" : "critical",
    classifyTrendHealth(signals.salesChangeBp),
    classifyTrendHealth(signals.profitChangeBp),
    classifyCountHealth(signals.pendingReviewCount, 1, 8),
    classifyCountHealth(signals.stuckOrderCount, 1, 5),
    classifyCountHealth(signals.outOfStockCount, 1, 4),
    classifyCountHealth(signals.lowStockCount, 3, 10),
    classifyCountHealth(signals.rejectedPaymentCount, 1, 6),
  ]);
}

export function classifyAreaHealth(
  area: "sales" | "profit" | "inventory" | "customers" | "orders" | "growth",
  signals: HealthSignals,
): HealthLevel {
  switch (area) {
    case "sales":
    case "growth":
      return classifyTrendHealth(signals.salesChangeBp);
    case "profit":
      return classifyTrendHealth(signals.profitChangeBp);
    case "inventory":
      return worstHealth([
        classifyCountHealth(signals.outOfStockCount, 1, 4),
        classifyCountHealth(signals.lowStockCount, 3, 10),
      ]);
    case "orders":
      return worstHealth([
        classifyCountHealth(signals.pendingReviewCount, 1, 8),
        classifyCountHealth(signals.stuckOrderCount, 1, 5),
      ]);
    case "customers":
      return classifyTrendHealth(signals.salesChangeBp) === "critical" ? "attention" : "healthy";
    default:
      return "healthy";
  }
}

const SEVERITY_RANK: Record<AttentionSeverity, number> = {
  critical: 0,
  warning: 1,
};

/** موارد مهم‌تر بالاتر؛ پایدار برای ترتیب یکسان در UI. */
export function rankAttentionItems(items: readonly AttentionItem[]): AttentionItem[] {
  return [...items].sort((a, b) => {
    const severity = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    if (severity !== 0) return severity;
    return a.id.localeCompare(b.id);
  });
}

export function buildAttentionItems(signals: HealthSignals): AttentionItem[] {
  const items: AttentionItem[] = [];

  if (!signals.shopOpen) {
    items.push({
      id: "shop-closed",
      severity: "critical",
      title: "فروشگاه بسته است؛ فروش متوقف شده.",
      href: "/admin/settings",
    });
  }

  if (!signals.goldPriceAvailable) {
    items.push({
      id: "gold-price-missing",
      severity: "critical",
      title: "قیمت طلا ثبت نشده؛ فروش ممکن نیست.",
      href: "/admin/gold-price",
    });
  }

  if (signals.salesChangeBp !== null && signals.salesChangeBp <= DROP_ATTENTION_BP) {
    items.push({
      id: "sales-drop",
      severity: signals.salesChangeBp <= DROP_CRITICAL_BP ? "critical" : "warning",
      title: "کاهش غیرعادی فروش نسبت به دوره قبل.",
      href: "/admin/reports",
    });
  }

  if (signals.profitChangeBp !== null && signals.profitChangeBp <= DROP_ATTENTION_BP) {
    items.push({
      id: "profit-drop",
      severity: signals.profitChangeBp <= DROP_CRITICAL_BP ? "critical" : "warning",
      title: "کاهش غیرعادی سود نسبت به دوره قبل.",
      href: "/admin/reports",
    });
  }

  if (signals.pendingReviewCount > 0) {
    items.push({
      id: "pending-review",
      severity: signals.pendingReviewCount >= 8 ? "critical" : "warning",
      title: "پرداخت در صف تایید است.",
      href: "/admin/payments",
      count: signals.pendingReviewCount,
    });
  }

  if (signals.stuckOrderCount > 0) {
    items.push({
      id: "stuck-orders",
      severity: signals.stuckOrderCount >= 5 ? "critical" : "warning",
      title: "سفارش بیش از سه روز در آماده‌سازی مانده است.",
      href: "/admin/orders",
      count: signals.stuckOrderCount,
    });
  }

  if (signals.rejectedPaymentCount > 0) {
    items.push({
      id: "rejected-payments",
      severity: "warning",
      title: "پرداخت ردشده در انتظار پیگیری است.",
      href: "/admin/payments",
      count: signals.rejectedPaymentCount,
    });
  }

  if (signals.outOfStockCount > 0) {
    items.push({
      id: "out-of-stock",
      severity: signals.outOfStockCount >= 4 ? "critical" : "warning",
      title: "گونه ناموجود است.",
      href: "/admin/products",
      count: signals.outOfStockCount,
    });
  }

  if (signals.lowStockCount > 0) {
    items.push({
      id: "low-stock",
      severity: "warning",
      title: "گونه موجودی محدود دارد.",
      href: "/admin/products",
      count: signals.lowStockCount,
    });
  }

  return rankAttentionItems(items);
}

/** گردش موجودی: فروش دوره ÷ موجودی فعلی، به‌صورت صدم‌درصد. */
export function inventoryTurnoverBp(soldMg: number, stockMg: number): number | null {
  if (stockMg <= 0) return null;
  return mulDiv(soldMg, 10_000, stockMg);
}

export const ORDER_PIPELINE_GROUPS = [
  { key: "new", label: "جدید", statuses: ["created", "payment_pending"] },
  {
    key: "prep",
    label: "آماده‌سازی",
    statuses: ["paid", "processing", "personalization", "quality_check"],
  },
  { key: "ready", label: "آماده ارسال", statuses: ["packed"] },
  { key: "shipped", label: "ارسال", statuses: ["shipped"] },
  { key: "delivered", label: "تحویل", statuses: ["delivered"] },
  { key: "cancelled", label: "لغو", statuses: ["cancelled"] },
  { key: "returned", label: "مرجوع", statuses: ["refunded", "refund_pending"] },
] as const satisfies readonly {
  key: string;
  label: string;
  statuses: readonly OrderStatus[];
}[];

export interface OrderPipelineCount {
  key: string;
  label: string;
  count: number;
}

export function summarizeOrderPipeline(
  byStatus: Record<OrderStatus, number>,
  returnedShipmentCount: number,
): OrderPipelineCount[] {
  return ORDER_PIPELINE_GROUPS.map((group) => {
    const statusTotal = group.statuses.reduce((sum, status) => sum + (byStatus[status] ?? 0), 0);
    return {
      key: group.key,
      label: group.label,
      count: group.key === "returned" ? statusTotal + returnedShipmentCount : statusTotal,
    };
  });
}

export const HEALTH_AREA_LABELS: Record<
  "sales" | "profit" | "inventory" | "customers" | "orders" | "growth",
  string
> = {
  sales: "فروش",
  profit: "سود",
  inventory: "موجودی",
  customers: "مشتری",
  orders: "سفارش",
  growth: "رشد",
};

export const HEALTH_AREA_KEYS = [
  "sales",
  "profit",
  "inventory",
  "customers",
  "orders",
  "growth",
] as const;

export const CHANNEL_PLACEHOLDER =
  "فقط فروش سایت ثبت می‌شود؛ کانال دیگری تعریف نشده.";

export const FUNNEL_PLACEHOLDER =
  "ردیابی بازدید و سبد هنوز فعال نیست؛ عددی نمایش داده نمی‌شود.";

export const SHOP_NAME = "هفت منظومه";

/** حاشیه قلم سفارش: سود زیور به‌علاوه حباب سکه/شمش، ضرب در تعداد. */
export function lineMarginRial(
  profitRial: number,
  premiumRial: number,
  quantity: number,
): number {
  return mulDiv(profitRial + premiumRial, quantity, 1);
}
