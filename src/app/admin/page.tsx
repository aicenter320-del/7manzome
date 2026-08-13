import { getDashboardStats, StatCard } from "@/modules/admin";
import { requireStaff } from "@/server/auth/guards";
import { toPersianDigits } from "@/shared/lib/persian";
import { GoldWeight } from "@/shared/ui/gold-weight";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";

export default async function AdminHomePage() {
  await requireStaff();
  const stats = await getDashboardStats();

  return (
    <div className="grid gap-8">
      <PageHeader
        title="داشبورد مدیریت"
        description={stats.shopOpen ? "فروشگاه باز است." : "فروشگاه در حال حاضر بسته است."}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="فروش امروز" value={<Money rial={stats.todaySalesRial} short />} />
        <StatCard label="طلای امروز" value={<GoldWeight mg={stats.todayGoldMg} />} />
        <StatCard label="سفارش امروز" value={toPersianDigits(stats.todayOrderCount)} />
        <StatCard label="گنجینه‌های فعال" value={toPersianDigits(stats.activeTreasureCount)} />
        <StatCard label="هدیه امروز" value={toPersianDigits(stats.todayGiftCount)} />
        <StatCard label="صف تایید پرداخت" value={toPersianDigits(stats.pendingReviewCount)} />
        <StatCard label="کاربران" value={toPersianDigits(stats.totalUsers)} />
      </div>
    </div>
  );
}
