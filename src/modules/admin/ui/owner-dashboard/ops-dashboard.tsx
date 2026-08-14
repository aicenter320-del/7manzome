import { toPersianDigits } from "@/shared/lib/persian";
import { GoldWeight } from "@/shared/ui/gold-weight";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";

import type { DashboardStats } from "../../domain/types";
import { StatCard } from "../stat-card";

/** خلاصه عملیاتی برای نقش‌هایی که سود و ارزش موجودی نمی‌بینند. */
export function OpsDashboard({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-8">
      <PageHeader
        title="داشبورد مدیریت"
        description={stats.shopOpen ? "فروشگاه باز است." : "فروشگاه در حال حاضر بسته است."}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="فروش امروز"
          value={<Money rial={stats.todaySalesRial} short />}
          href="/admin/payments"
        />
        <StatCard
          label="طلای امروز"
          value={<GoldWeight mg={stats.todayGoldMg} />}
          href="/admin/reports"
        />
        <StatCard
          label="سفارش امروز"
          value={toPersianDigits(stats.todayOrderCount)}
          href="/admin/orders"
        />
        <StatCard
          label="گنجینه‌های فعال"
          value={toPersianDigits(stats.activeTreasureCount)}
          href="/admin/treasures"
        />
        <StatCard
          label="هدیه امروز"
          value={toPersianDigits(stats.todayGiftCount)}
          href="/admin/reports"
        />
        <StatCard
          label="صف تایید پرداخت"
          value={toPersianDigits(stats.pendingReviewCount)}
          href="/admin/payments"
        />
        <StatCard
          label="کاربران"
          value={toPersianDigits(stats.totalUsers)}
          href="/admin/users"
        />
      </div>
    </div>
  );
}
