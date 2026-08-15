import "server-only";

import { listActiveInventoryVariants } from "@/modules/catalog";
import { getSetting } from "@/modules/content";
import { countConfirmedContributionsSince } from "@/modules/gifting";
import { getUserCount } from "@/modules/identity";
import { countOrdersSince, countStuckOrders, sumGoldTotalMgSince } from "@/modules/orders";
import {
  countInReviewQueue,
  getConfirmedAmountSince,
} from "@/modules/payments";
import { getActiveTreasureCount, getGoldCoverSummary, getTotalGoldSavedMg } from "@/modules/treasury";
import { startOfJalaliMonth, startOfTehranDay } from "@/shared/lib/jalali";

import type { DashboardStats, SalesReport, SalesReportRow, TreasuryReport } from "../domain/types";

const DAY_MS = 86_400_000;
const STUCK_AFTER_MS = 3 * DAY_MS;

async function periodRow(input: {
  periodLabel: string;
  fromAt: number;
  toAt: number;
}): Promise<SalesReportRow> {
  const [confirmedAmountRial, goldSoldMg, orderCount, giftCount] = await Promise.all([
    getConfirmedAmountSince(input.fromAt),
    sumGoldTotalMgSince(input.fromAt),
    countOrdersSince(input.fromAt),
    countConfirmedContributionsSince(input.fromAt),
  ]);

  return {
    periodLabel: input.periodLabel,
    fromAt: input.fromAt,
    toAt: input.toAt,
    confirmedAmountRial,
    goldSoldMg,
    orderCount,
    giftCount,
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const todayStart = startOfTehranDay();
  const stuckCutoff = Date.now() - STUCK_AFTER_MS;

  const [
    todaySalesRial,
    todayGoldMg,
    todayOrderCount,
    activeTreasureCount,
    todayGiftCount,
    pendingReviewCount,
    stuckOrderCount,
    goldCover,
    inventory,
    totalUsers,
    shopOpen,
  ] = await Promise.all([
    getConfirmedAmountSince(todayStart),
    sumGoldTotalMgSince(todayStart),
    countOrdersSince(todayStart),
    getActiveTreasureCount(),
    countConfirmedContributionsSince(todayStart),
    countInReviewQueue(),
    countStuckOrders(stuckCutoff),
    getGoldCoverSummary(),
    listActiveInventoryVariants(),
    getUserCount(),
    getSetting("shop.is_open"),
  ]);

  return {
    todaySalesRial,
    todayGoldMg,
    todayOrderCount,
    activeTreasureCount,
    todayGiftCount,
    pendingReviewCount,
    stuckOrderCount,
    uncoveredGoldMg: goldCover.remainingMg,
    outOfStockCount: inventory.filter((variant) => variant.stockQty <= 0).length,
    totalUsers,
    shopOpen,
  };
}

export async function getSalesReport(nowMs: number = Date.now()): Promise<SalesReport> {
  const todayStart = startOfTehranDay(nowMs);
  const monthStart = startOfJalaliMonth(nowMs);

  return Promise.all([
    periodRow({ periodLabel: "امروز", fromAt: todayStart, toAt: nowMs }),
    periodRow({ periodLabel: "این ماه", fromAt: monthStart, toAt: nowMs }),
  ]);
}

export async function getTreasuryReport(): Promise<TreasuryReport> {
  const [totalGoldSavedMg, activeTreasureCount] = await Promise.all([
    getTotalGoldSavedMg(),
    getActiveTreasureCount(),
  ]);

  return { totalGoldSavedMg, activeTreasureCount };
}
