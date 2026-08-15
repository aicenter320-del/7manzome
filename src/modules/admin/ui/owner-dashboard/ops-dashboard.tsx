import Link from "next/link";

import { toPersianDigits } from "@/shared/lib/persian";
import { Badge } from "@/shared/ui/badge";
import { GoldWeight } from "@/shared/ui/gold-weight";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";

import type { DashboardStats } from "../../domain/types";
import { StatCard } from "../stat-card";

/** خلاصه عملیاتی برای نقش‌هایی که سود و ارزش موجودی نمی‌بینند. */
export function OpsDashboard({ stats }: { stats: DashboardStats }) {
  const work = [
    stats.pendingReviewCount > 0
      ? {
          id: "pending-review",
          href: "/admin/payments",
          title: "پرداخت در صف تایید است.",
          count: stats.pendingReviewCount,
        }
      : null,
    stats.stuckOrderCount > 0
      ? {
          id: "stuck-orders",
          href: "/admin/orders",
          title: "سفارش بیش از سه روز در آماده‌سازی مانده است.",
          count: stats.stuckOrderCount,
        }
      : null,
    stats.uncoveredGoldMg > 0
      ? {
          id: "uncovered-gold",
          href: "/admin/treasures",
          title: "طلای گنجینه هنوز خرید نشده.",
        }
      : null,
    stats.outOfStockCount > 0
      ? {
          id: "out-of-stock",
          href: "/admin/products",
          title: "گونه ناموجود است.",
          count: stats.outOfStockCount,
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="grid gap-8">
      <PageHeader
        title="داشبورد مدیریت"
        description={stats.shopOpen ? "فروشگاه باز است." : "فروشگاه در حال حاضر بسته است."}
      />

      <section className="glass grid gap-3 rounded-3xl p-5">
        <h2 className="font-semibold">کار امروز</h2>
        {work.length === 0 ? (
          <p className="text-sm text-muted-foreground">کار بازی برای امروز نیست.</p>
        ) : (
          <ul className="grid gap-1">
            {work.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 hover:bg-muted"
                >
                  <span className="text-sm">
                    {item.title}
                    {"count" in item && item.count !== undefined ? (
                      <span className="ms-2 text-muted-foreground">{toPersianDigits(item.count)}</span>
                    ) : null}
                  </span>
                  <Badge variant="warning">هشدار</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

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
