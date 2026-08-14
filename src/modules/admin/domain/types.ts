/**
 * انواع گزارش و داشبورد مدیریت.
 * این ماژول جدول اختصاصی ندارد؛ فقط تجمع داده ماژول‌های دیگر است.
 */

import type {
  AttentionItem,
  DashboardRange,
  HealthLevel,
  OrderPipelineCount,
} from "./owner-dashboard";

export interface DashboardStats {
  todaySalesRial: number;
  todayGoldMg: number;
  todayOrderCount: number;
  activeTreasureCount: number;
  todayGiftCount: number;
  pendingReviewCount: number;
  totalUsers: number;
  shopOpen: boolean;
}

export interface SalesReportRow {
  periodLabel: string;
  fromAt: number;
  toAt: number;
  confirmedAmountRial: number;
  goldSoldMg: number;
  orderCount: number;
  giftCount: number;
}

export type SalesReport = SalesReportRow[];

export interface TreasuryReport {
  totalGoldSavedMg: number;
  activeTreasureCount: number;
}

export interface OwnerKpis {
  todaySalesRial: number;
  todaySalesChangeBp: number | null;
  monthSalesRial: number;
  monthSalesChangeBp: number | null;
  monthProfitRial: number;
  monthProfitChangeBp: number | null;
  inventoryValueRial: number;
  inventoryWeightMg: number;
}

export interface OwnerTrendPoint {
  startAt: number;
  endAt: number;
  label: string;
  salesRial: number;
  profitRial: number;
  orderCount: number;
  goldMg: number;
}

export interface OwnerProductRank {
  title: string;
  quantity: number;
  marginRial: number;
}

export interface OwnerGrowingProduct {
  title: string;
  changeBp: number;
}

export interface OwnerGoldStatus {
  stockWeightMg: number;
  stockValueRial: number;
  sold30dMg: number;
  /** تقریبی: ورود انبار ثبت نمی‌شود؛ برابر منفی فروش دوره. */
  estimatedChangeMg: number;
  turnoverBp: number | null;
}

export interface OwnerCustomers {
  newCount: number;
  repeatCount: number;
  repeatRateBp: number | null;
  averageOrderRial: number;
  lifetimeValueRial: number;
  inactiveCount: number;
}

export interface OwnerHealthArea {
  key: "sales" | "profit" | "inventory" | "customers" | "orders" | "growth";
  label: string;
  level: HealthLevel;
}

export interface OwnerDashboard {
  generatedAt: number;
  range: DashboardRange;
  shopName: string;
  overallHealth: HealthLevel;
  goldPricePerGramRial: number | null;
  goldPriceChangeBp: number | null;
  kpis: OwnerKpis;
  trend: OwnerTrendPoint[];
  attention: AttentionItem[];
  gold: OwnerGoldStatus;
  topByQty: OwnerProductRank[];
  topByMargin: OwnerProductRank[];
  stagnantTitles: string[];
  growing: OwnerGrowingProduct[];
  customers: OwnerCustomers;
  orders: OrderPipelineCount[];
  areas: OwnerHealthArea[];
  channelMessage: string;
  funnelMessage: string;
}
