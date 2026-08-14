import {
  getDashboardStats,
  getOwnerDashboard,
  OpsDashboard,
  OwnerDashboardView,
  parseDashboardRange,
} from "@/modules/admin";
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

  const dashboard = await getOwnerDashboard(parseDashboardRange(rangeValue));
  return <OwnerDashboardView dashboard={dashboard} />;
}
