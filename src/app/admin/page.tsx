import {
  getDashboardStats,
  getOwnerDashboard,
  OpsDashboard,
  OwnerDashboardView,
  parseDashboardRange,
} from "@/modules/admin";
import { getSetting } from "@/modules/content";
import { requireStaff } from "@/server/auth/guards";
import { hasPermission } from "@/server/auth/rbac";

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string | string[] }>;
}) {
  const user = await requireStaff();
  const rawRange = (await searchParams).range;
  const rangeValue = Array.isArray(rawRange) ? rawRange[0] : rawRange;

  if (!hasPermission(user.roles, "report:read")) {
    const stats = await getDashboardStats();
    return <OpsDashboard stats={stats} />;
  }

  const [dashboard, liveMarkupBp] = await Promise.all([
    getOwnerDashboard(parseDashboardRange(rangeValue)),
    getSetting("pricing.live_markup_bp"),
  ]);

  return (
    <OwnerDashboardView
      dashboard={dashboard}
      liveMarkupBp={liveMarkupBp}
      canEditLiveMarkup={hasPermission(user.roles, "settings:write")}
    />
  );
}
