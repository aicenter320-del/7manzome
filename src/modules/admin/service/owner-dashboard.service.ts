import "server-only";

import { listActiveInventoryVariants } from "@/modules/catalog";
import { getSetting } from "@/modules/content";
import { getCustomerSignupCount } from "@/modules/identity";
import {
  countOrdersByStatus,
  countReturnedShipments,
  countStuckOrders,
  findBuyerStats,
  findCountedOrdersBetween,
  findOrderItemMarginsBetween,
} from "@/modules/orders";
import {
  countInReviewQueue,
  countRejectedSince,
  getConfirmedAmountBetween,
  listConfirmedSalesBetween,
} from "@/modules/payments";
import {
  calculateVariantPrice,
  getAllCurrentGoldPrices,
  listGoldPriceHistory,
  tryGetCurrentGoldPrice,
} from "@/modules/pricing";
import { getGoldCoverSummary } from "@/modules/treasury";
import { DISPLAY_KARAT } from "@/shared/lib/gold";
import { startOfJalaliMonth, startOfTehranDay } from "@/shared/lib/jalali";
import { mulDiv, sumIntegers } from "@/shared/lib/math";

import {
  buildAttentionItems,
  buildTimeBuckets,
  CHANNEL_PLACEHOLDER,
  classifyAreaHealth,
  classifyOverallHealth,
  FUNNEL_PLACEHOLDER,
  HEALTH_AREA_KEYS,
  HEALTH_AREA_LABELS,
  inventoryTurnoverBp,
  lineMarginRial,
  percentChangeBp,
  resolveDashboardRange,
  SHOP_NAME,
  summarizeOrderPipeline,
  type DashboardRange,
  type HealthSignals,
} from "../domain/owner-dashboard";
import type {
  OwnerDashboard,
  OwnerGrowingProduct,
  OwnerProductRank,
  OwnerTrendPoint,
} from "../domain/types";

const DAY_MS = 86_400_000;
const STUCK_AFTER_MS = 3 * DAY_MS;
const REJECTED_RECENT_MS = 7 * DAY_MS;
const INACTIVE_AFTER_MS = 90 * DAY_MS;
const LOW_STOCK_MAX = 3;
const TOP_PRODUCT_LIMIT = 5;
const STAGNANT_LIMIT = 8;
const GROWTH_MIN_BP = 2_000;

function addAmount(target: OwnerTrendPoint, field: keyof Pick<
  OwnerTrendPoint,
  "salesRial" | "profitRial" | "orderCount" | "goldMg"
>, amount: number): void {
  target[field] += amount;
}

function putInBucket(
  series: OwnerTrendPoint[],
  at: number,
  field: keyof Pick<OwnerTrendPoint, "salesRial" | "profitRial" | "orderCount" | "goldMg">,
  amount: number,
): void {
  const bucket = series.find((item) => at >= item.startAt && at < item.endAt);
  if (bucket) addAmount(bucket, field, amount);
}

function totalMargins(
  items: { profitRial: number; premiumRial: number; quantity: number }[],
): number {
  if (items.length === 0) return 0;
  return sumIntegers(
    items.map((item) => lineMarginRial(item.profitRial, item.premiumRial, item.quantity)),
  );
}

function rankProducts(
  items: {
    productTitle: string;
    quantity: number;
    profitRial: number;
    premiumRial: number;
  }[],
): Map<string, { quantity: number; marginRial: number }> {
  const byTitle = new Map<string, { quantity: number; marginRial: number }>();

  for (const item of items) {
    const current = byTitle.get(item.productTitle) ?? { quantity: 0, marginRial: 0 };
    current.quantity += item.quantity;
    current.marginRial += lineMarginRial(item.profitRial, item.premiumRial, item.quantity);
    byTitle.set(item.productTitle, current);
  }

  return byTitle;
}

function topRanks(
  byTitle: Map<string, { quantity: number; marginRial: number }>,
  field: "quantity" | "marginRial",
): OwnerProductRank[] {
  return [...byTitle.entries()]
    .map(([title, stats]) => ({ title, quantity: stats.quantity, marginRial: stats.marginRial }))
    .sort((a, b) => b[field] - a[field] || a.title.localeCompare(b.title, "fa"))
    .slice(0, TOP_PRODUCT_LIMIT);
}

export async function getOwnerDashboard(
  range: DashboardRange,
  nowMs: number = Date.now(),
): Promise<OwnerDashboard> {
  const resolved = resolveDashboardRange(range, nowMs);
  const todayStart = startOfTehranDay(nowMs);
  const monthStart = startOfJalaliMonth(nowMs);
  const previousMonthStart = startOfJalaliMonth(monthStart - 1);
  const last30d = resolveDashboardRange("30d", nowMs);
  const stuckCutoff = nowMs - STUCK_AFTER_MS;
  const rejectedFrom = nowMs - REJECTED_RECENT_MS;
  const inactiveCutoff = nowMs - INACTIVE_AFTER_MS;

  const [
    shopOpen,
    goldPrice,
    goldHistory,
    vatBp,
    pricesByKarat,
    todaySalesRial,
    yesterdaySalesRial,
    monthSalesRial,
    previousMonthSalesRial,
    monthMarginItems,
    previousMonthMarginItems,
    rangeSales,
    previousRangeSales,
    rangeMarginItems,
    previousRangeMarginItems,
    rangeOrders,
    items30d,
    itemsPrevious30d,
    orders30d,
    inventory,
    pendingReviewCount,
    stuckOrderCount,
    rejectedPaymentCount,
    ordersByStatus,
    returnedShipmentCount,
    buyers,
    newCustomerCount,
    goldCover,
  ] = await Promise.all([
    getSetting("shop.is_open"),
    tryGetCurrentGoldPrice(DISPLAY_KARAT),
    listGoldPriceHistory(DISPLAY_KARAT, 2),
    getSetting("pricing.vat_bp"),
    getAllCurrentGoldPrices(),
    getConfirmedAmountBetween(todayStart, nowMs),
    getConfirmedAmountBetween(todayStart - DAY_MS, todayStart),
    getConfirmedAmountBetween(monthStart, nowMs),
    getConfirmedAmountBetween(previousMonthStart, monthStart),
    findOrderItemMarginsBetween(monthStart, nowMs),
    findOrderItemMarginsBetween(previousMonthStart, monthStart),
    listConfirmedSalesBetween(resolved.fromAt, resolved.toAt),
    listConfirmedSalesBetween(resolved.previousFromAt, resolved.previousToAt),
    findOrderItemMarginsBetween(resolved.fromAt, resolved.toAt),
    findOrderItemMarginsBetween(resolved.previousFromAt, resolved.previousToAt),
    findCountedOrdersBetween(resolved.fromAt, resolved.toAt),
    findOrderItemMarginsBetween(last30d.fromAt, last30d.toAt),
    findOrderItemMarginsBetween(last30d.previousFromAt, last30d.previousToAt),
    findCountedOrdersBetween(last30d.fromAt, last30d.toAt),
    listActiveInventoryVariants(),
    countInReviewQueue(),
    countStuckOrders(stuckCutoff),
    countRejectedSince(rejectedFrom, nowMs),
    countOrdersByStatus(),
    countReturnedShipments(),
    findBuyerStats(),
    getCustomerSignupCount(last30d.fromAt, last30d.toAt),
    getGoldCoverSummary(),
  ]);

  const monthProfitRial = totalMargins(monthMarginItems);
  const previousMonthProfitRial = totalMargins(previousMonthMarginItems);
  const rangeSalesRial = sumIntegers(rangeSales.map((row) => row.amountRial));
  const previousRangeSalesRial = sumIntegers(previousRangeSales.map((row) => row.amountRial));
  const rangeProfitRial = totalMargins(rangeMarginItems);
  const previousRangeProfitRial = totalMargins(previousRangeMarginItems);

  let inventoryWeightMg = 0;
  let inventoryValueRial = 0;
  let outOfStockCount = 0;
  let lowStockCount = 0;

  for (const variant of inventory) {
    const lineWeight = mulDiv(variant.weightMg, variant.stockQty, 1);
    inventoryWeightMg += lineWeight;

    if (variant.stockQty <= 0) outOfStockCount += 1;
    else if (variant.stockQty <= LOW_STOCK_MAX) lowStockCount += 1;

    const livePrice = pricesByKarat[String(variant.karat)];
    if (!livePrice || variant.stockQty <= 0) continue;

    const breakdown = calculateVariantPrice({
      params: {
        kind: variant.kind,
        weightMg: variant.weightMg,
        karat: variant.karat,
        makingFeeBp: variant.makingFeeBp,
        profitBp: variant.profitBp,
        premiumRial: variant.premiumRial,
        packagingRial: variant.packagingRial,
        personalizationRial: variant.personalizationRial,
      },
      goldPricePerGramRial: livePrice,
      vatBp,
    });
    inventoryValueRial += mulDiv(breakdown.unitPriceRial, variant.stockQty, 1);
  }

  const buckets = buildTimeBuckets(resolved.fromAt, resolved.toAt, resolved.grain);
  const trend: OwnerTrendPoint[] = buckets.map((bucket) => ({
    ...bucket,
    salesRial: 0,
    profitRial: 0,
    orderCount: 0,
    goldMg: 0,
  }));

  for (const sale of rangeSales) {
    putInBucket(trend, sale.confirmedAt, "salesRial", sale.amountRial);
  }
  for (const item of rangeMarginItems) {
    putInBucket(
      trend,
      item.paidAt,
      "profitRial",
      lineMarginRial(item.profitRial, item.premiumRial, item.quantity),
    );
  }
  for (const order of rangeOrders) {
    putInBucket(trend, order.paidAt, "orderCount", 1);
    putInBucket(trend, order.paidAt, "goldMg", order.goldTotalMg);
  }

  const ranks30d = rankProducts(items30d);
  const ranksPrevious30d = rankProducts(itemsPrevious30d);
  const topByQty = topRanks(ranks30d, "quantity");
  const topByMargin = topRanks(ranks30d, "marginRial");

  const activeTitles = [...new Set(inventory.map((row) => row.productTitle))];
  const stagnantTitles = activeTitles
    .filter((title) => (ranks30d.get(title)?.quantity ?? 0) === 0)
    .sort((a, b) => a.localeCompare(b, "fa"))
    .slice(0, STAGNANT_LIMIT);

  const growing: OwnerGrowingProduct[] = [];
  for (const [title, current] of ranks30d) {
    const previousQty = ranksPrevious30d.get(title)?.quantity ?? 0;
    const changeBp = percentChangeBp(current.quantity, previousQty);
    if (changeBp !== null && changeBp >= GROWTH_MIN_BP) {
      growing.push({ title, changeBp });
    }
  }
  growing.sort((a, b) => b.changeBp - a.changeBp || a.title.localeCompare(b.title, "fa"));
  const growingTop = growing.slice(0, TOP_PRODUCT_LIMIT);

  const sold30dMg = sumIntegers(orders30d.map((order) => order.goldTotalMg));
  const buyerCount = buyers.length;
  const repeatCount = buyers.filter((row) => row.orderCount >= 2).length;
  const totalOrders = sumIntegers(buyers.map((row) => row.orderCount));
  const totalSpentRial = sumIntegers(buyers.map((row) => row.spentRial));
  const inactiveCount = buyers.filter((row) => row.lastPaidAt < inactiveCutoff).length;

  const salesChangeBp = percentChangeBp(rangeSalesRial, previousRangeSalesRial);
  const profitChangeBp = percentChangeBp(rangeProfitRial, previousRangeProfitRial);

  const signals: HealthSignals = {
    shopOpen,
    goldPriceAvailable: goldPrice !== null,
    pendingReviewCount,
    stuckOrderCount,
    outOfStockCount,
    lowStockCount,
    rejectedPaymentCount,
    uncoveredGoldMg: goldCover.remainingMg,
    salesChangeBp,
    profitChangeBp,
  };

  const previousGold = goldHistory[1]?.pricePerGramRial ?? null;
  const currentGold = goldPrice?.pricePerGramRial ?? goldHistory[0]?.pricePerGramRial ?? null;

  return {
    generatedAt: nowMs,
    range: resolved.range,
    shopName: SHOP_NAME,
    overallHealth: classifyOverallHealth(signals),
    goldPricePerGramRial: currentGold,
    goldPriceChangeBp:
      currentGold !== null && previousGold !== null
        ? percentChangeBp(currentGold, previousGold)
        : null,
    kpis: {
      todaySalesRial,
      todaySalesChangeBp: percentChangeBp(todaySalesRial, yesterdaySalesRial),
      monthSalesRial,
      monthSalesChangeBp: percentChangeBp(monthSalesRial, previousMonthSalesRial),
      monthProfitRial,
      monthProfitChangeBp: percentChangeBp(monthProfitRial, previousMonthProfitRial),
      inventoryValueRial,
      inventoryWeightMg,
    },
    trend,
    attention: buildAttentionItems(signals),
    gold: {
      stockWeightMg: inventoryWeightMg,
      stockValueRial: inventoryValueRial,
      sold30dMg,
      estimatedChangeMg: -sold30dMg,
      turnoverBp: inventoryTurnoverBp(sold30dMg, inventoryWeightMg),
    },
    topByQty,
    topByMargin,
    stagnantTitles,
    growing: growingTop,
    customers: {
      newCount: newCustomerCount,
      repeatCount,
      repeatRateBp: buyerCount === 0 ? null : mulDiv(repeatCount, 10_000, buyerCount),
      averageOrderRial: totalOrders === 0 ? 0 : mulDiv(totalSpentRial, 1, totalOrders),
      lifetimeValueRial: buyerCount === 0 ? 0 : mulDiv(totalSpentRial, 1, buyerCount),
      inactiveCount,
    },
    orders: summarizeOrderPipeline(ordersByStatus, returnedShipmentCount),
    areas: HEALTH_AREA_KEYS.map((key) => ({
      key,
      label: HEALTH_AREA_LABELS[key],
      level: classifyAreaHealth(key, signals),
    })),
    channelMessage: CHANNEL_PLACEHOLDER,
    funnelMessage: FUNNEL_PLACEHOLDER,
  };
}
