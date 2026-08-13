/**
 * ماژول مدیریت — API عمومی.
 *
 * مسئول: داشبورد، گزارش‌های تجمعی و ارکستراسیون عملیات چندماژولی مثل
 * تایید پرداخت و تسویه سفارش/مشارکت. جدول اختصاصی ندارد.
 *
 * مستندات: docs/03-modules/admin.md
 */

export type { DashboardStats, SalesReport, SalesReportRow, TreasuryReport } from "./domain/types";

export { getDashboardStats, getSalesReport, getTreasuryReport } from "./service/report.service";

export { reviewAndSettlePayment, expireStalePaymentsAction } from "./actions/admin.actions";

export { StatCard } from "./ui/stat-card";
export { DataTable, TableCell, TableRow } from "./ui/data-table";
export { adminNav, type AdminNavItem } from "./ui/admin-nav";
