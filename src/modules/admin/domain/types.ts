/**
 * انواع گزارش و داشبورد مدیریت.
 * این ماژول جدول اختصاصی ندارد؛ فقط تجمع داده ماژول‌های دیگر است.
 */

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
