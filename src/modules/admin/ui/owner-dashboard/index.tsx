import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import { formatJalaliDateTime, formatJalaliDateWithWeekday } from "@/shared/lib/jalali";
import { mulDiv } from "@/shared/lib/math";
import { toPersianDigits } from "@/shared/lib/persian";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { GoldWeight } from "@/shared/ui/gold-weight";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";

import {
  DASHBOARD_RANGE_LABELS,
  DASHBOARD_RANGES,
  HEALTH_LABELS,
  type HealthLevel,
} from "../../domain/owner-dashboard";
import type { OwnerDashboard } from "../../domain/types";
import { StatCard } from "../stat-card";
import { ChangeBadge } from "./change-badge";
import { TrendChart } from "./trend-chart";

function healthBadge(level: HealthLevel) {
  const variant =
    level === "critical" ? "destructive" : level === "attention" ? "warning" : "gold";
  return <Badge variant={variant}>{HEALTH_LABELS[level]}</Badge>;
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle>{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function percentLabel(bp: number | null, empty = "—"): string {
  if (bp === null) return empty;
  return `${toPersianDigits(mulDiv(bp, 1, 100))}٪`;
}

export function OwnerDashboardView({ dashboard }: { dashboard: OwnerDashboard }) {
  const { kpis, gold, customers } = dashboard;

  return (
    <div className="grid gap-8">
      <PageHeader
        title={dashboard.shopName}
        description={formatJalaliDateWithWeekday(dashboard.generatedAt)}
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            {healthBadge(dashboard.overallHealth)}
            <p className="text-xs text-muted-foreground">
              به‌روز شده {formatJalaliDateTime(dashboard.generatedAt)}
            </p>
          </div>
        }
      />

      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
        <span className="text-muted-foreground">قیمت گرم ۱۸ عیار</span>
        {dashboard.goldPricePerGramRial !== null ? (
          <>
            <Money rial={dashboard.goldPricePerGramRial} />
            <ChangeBadge bp={dashboard.goldPriceChangeBp} emptyLabel="رکورد قبلی نیست" />
          </>
        ) : (
          <span className="text-destructive">قیمت طلا ثبت نشده است</span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="فروش امروز"
          value={<Money rial={kpis.todaySalesRial} short />}
          hint={<ChangeBadge bp={kpis.todaySalesChangeBp} />}
          href="/admin/payments"
        />
        <StatCard
          label="فروش این ماه"
          value={<Money rial={kpis.monthSalesRial} short />}
          hint={<ChangeBadge bp={kpis.monthSalesChangeBp} />}
          href="/admin/reports"
        />
        <StatCard
          label="سود این ماه"
          value={<Money rial={kpis.monthProfitRial} short />}
          hint={<ChangeBadge bp={kpis.monthProfitChangeBp} />}
          href="/admin/reports"
        />
        <StatCard
          label="ارزش موجودی فروشگاه"
          value={<Money rial={kpis.inventoryValueRial} short />}
          hint={
            <span className="text-xs text-muted-foreground">
              وزن انبار <GoldWeight mg={kpis.inventoryWeightMg} size="sm" />
            </span>
          }
          href="/admin/products"
        />
      </div>

      <Section
        title="روند"
        action={
          <div className="flex flex-wrap gap-1">
            {DASHBOARD_RANGES.map((range) => (
              <Link
                key={range}
                href={`/admin?range=${range}`}
                className={cn(
                  "rounded-full px-3 py-1 text-xs",
                  dashboard.range === range
                    ? "bg-gold-soft text-gold-deep"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {DASHBOARD_RANGE_LABELS[range]}
              </Link>
            ))}
          </div>
        }
      >
        {dashboard.trend.length === 0 ? (
          <p className="text-sm text-muted-foreground">در این بازه داده‌ای نیست.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            <TrendChart points={dashboard.trend} field="salesRial" label="فروش" />
            <TrendChart points={dashboard.trend} field="profitRial" label="سود" />
            <TrendChart points={dashboard.trend} field="orderCount" label="تعداد سفارش" />
            <TrendChart points={dashboard.trend} field="goldMg" label="وزن طلا" />
          </div>
        )}
      </Section>

      <Section title="نیازمند توجه">
        {dashboard.attention.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            در حال حاضر مورد مهمی برای توجه وجود ندارد.
          </p>
        ) : (
          <ul className="grid gap-2">
            {dashboard.attention.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 hover:bg-muted"
                >
                  <span className="text-sm">
                    {item.title}
                    {item.count !== undefined ? (
                      <span className="ms-2 text-muted-foreground">
                        {toPersianDigits(item.count)}
                      </span>
                    ) : null}
                  </span>
                  <Badge variant={item.severity === "critical" ? "destructive" : "warning"}>
                    {item.severity === "critical" ? "بحرانی" : "هشدار"}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="وضعیت طلای فروشگاه">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">وزن انبار</p>
            <GoldWeight mg={gold.stockWeightMg} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">ارزش انبار</p>
            <Money rial={gold.stockValueRial} short />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">طلای فروخته ۳۰ روز</p>
            <GoldWeight mg={gold.sold30dMg} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">گردش موجودی</p>
            <p className="font-medium">{percentLabel(gold.turnoverBp)}</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          ورود انبار در سیستم ثبت نمی‌شود؛ تغییر تقریبی موجودی برابر کاهش فروش ۳۰ روز (
          <GoldWeight mg={gold.sold30dMg} size="sm" />) است. گنجینهٔ کودکان موجودی کسب‌وکار نیست
          و اینجا نشان داده نمی‌شود.
        </p>
      </Section>

      <Section
        title="محصولات"
        action={
          <Link href="/admin/products" className="text-xs text-gold-deep">
            مشاهده فهرست
          </Link>
        }
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <ProductList
            title="پرفروش ۳۰ روز"
            empty="فروشی در این بازه نیست."
            items={dashboard.topByQty.map((row) => ({
              title: row.title,
              detail: `${toPersianDigits(row.quantity)} عدد`,
            }))}
          />
          <ProductList
            title="سودآور ۳۰ روز"
            empty="سودی در این بازه نیست."
            items={dashboard.topByMargin.map((row) => ({
              title: row.title,
              detail: <Money rial={row.marginRial} short />,
            }))}
          />
          <ProductList
            title="کم‌گردش"
            empty="محصول راکدی نیست."
            items={dashboard.stagnantTitles.map((title) => ({ title, detail: "بدون فروش" }))}
          />
          <ProductList
            title="رشد سریع"
            empty="برای مقایسه دو بازه داده کافی نیست."
            items={dashboard.growing.map((row) => ({
              title: row.title,
              detail: percentLabel(row.changeBp),
            }))}
          />
        </div>
      </Section>

      <Section title="مشتریان">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Metric label="جدید در ۳۰ روز" value={toPersianDigits(customers.newCount)} />
          <Metric label="تکراری" value={toPersianDigits(customers.repeatCount)} />
          <Metric label="نرخ تکرار" value={percentLabel(customers.repeatRateBp)} />
          <Metric label="میانگین ارزش سفارش" value={<Money rial={customers.averageOrderRial} short />} />
          <Metric
            label="ارزش طول عمر ساده"
            value={<Money rial={customers.lifetimeValueRial} short />}
          />
          <Metric label="غیرفعال بیش از ۹۰ روز" value={toPersianDigits(customers.inactiveCount)} />
        </div>
      </Section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="کانال‌ها">
          <p className="text-sm text-muted-foreground">{dashboard.channelMessage}</p>
        </Section>
        <Section title="قیف فروش">
          <p className="text-sm text-muted-foreground">{dashboard.funnelMessage}</p>
        </Section>
      </div>

      <Section title="سفارش‌ها">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {dashboard.orders.map((row) => (
            <Metric key={row.key} label={row.label} value={toPersianDigits(row.count)} />
          ))}
        </div>
      </Section>

      <Section title="سلامت کسب‌وکار">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dashboard.areas.map((area) => (
            <li key={area.key} className="flex items-center justify-between gap-3">
              <span className="text-sm">{area.label}</span>
              {healthBadge(area.level)}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

function ProductList({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: { title: string; detail: ReactNode }[];
}) {
  return (
    <div className="grid gap-2">
      <p className="text-sm font-medium">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="grid gap-1.5">
          {items.map((item) => (
            <li key={item.title} className="flex items-center justify-between gap-3 text-sm">
              <span>{item.title}</span>
              <span className="text-muted-foreground">{item.detail}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export { OpsDashboard } from "./ops-dashboard";
