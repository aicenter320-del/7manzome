/**
 * ماژول مدیریت — API عمومی.
 *
 * مسئول: داشبورد، گزارش‌های تجمعی و ارکستراسیون عملیات چندماژولی مثل
 * تایید پرداخت و تسویه سفارش/مشارکت. جدول اختصاصی ندارد.
 *
 * مستندات: docs/03-modules/admin.md
 */

export type {
  DashboardStats,
  OwnerDashboard,
  SalesReport,
  SalesReportRow,
  TreasuryReport,
} from "./domain/types";
export type { MediaFolder } from "./domain/media-access";
export {
  MEDIA_FOLDER_LABELS,
  MEDIA_FOLDERS,
  canDeleteMediaFolder,
  foldersForPermissions,
  isMediaFolder,
} from "./domain/media-access";
export {
  DASHBOARD_RANGE_LABELS,
  DASHBOARD_RANGES,
  HEALTH_LABELS,
  parseDashboardRange,
} from "./domain/owner-dashboard";
export type { DashboardRange, HealthLevel } from "./domain/owner-dashboard";

export { getDashboardStats, getSalesReport, getTreasuryReport } from "./service/report.service";
export { getOwnerDashboard } from "./service/owner-dashboard.service";

export {
  expireStalePaymentsAction,
  reviewAndSettlePayment,
  softDeleteMediaFileAction,
  deleteAdminUser,
  adminUpdateChild,
  adminArchiveChild,
  adminUpdateTreasure,
  adminChangeTreasureStatus,
  adminDeleteEmptyTreasure,
  adminPauseGiftLink,
  adminResumeGiftLink,
  adminCloseGiftLink,
  adminVoidGiftCard,
} from "./actions/admin.actions";

export { StatCard } from "./ui/stat-card";
export { DataTable, TableCell, TableRow } from "./ui/data-table";
export { GlassFilterPills } from "./ui/glass-filter-pills";
export { adminNav, ADMIN_NAV_GROUPS, type AdminNavItem, type AdminNavGroupId } from "./ui/admin-nav";
export { AdminNavLink } from "./ui/admin-nav-link";
export { DeleteMediaFileButton } from "./ui/delete-media-file-button";
export { FolderFilterLinks, MediaFileCard, mediaFolderLabel } from "./ui/media-file-card";
export { OwnerDashboardView, OpsDashboard } from "./ui/owner-dashboard";
export { UserDetailTabs } from "./ui/user-detail/user-detail-tabs";
