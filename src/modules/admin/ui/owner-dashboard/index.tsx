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
import { LiveMarkupForm } from "./live-markup-form";
import { TrendChart } from "./trend-chart";

function healthBadge(level: HealthLevel) {
  const variant =
    level === "critical" ? "destructive" : level === "attention" ? "warning" : "success";
  return <Badge variant={variant}>{HEALTH_LABELS[level]}</Badge>;
}

function healthDot(level: HealthLevel) {
  return level === "critical"
    ? "bg-destructive"
    : level === "attention"
      ? "bg-warning"
      : "bg-success";
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

export function OwnerDashboardView({
  dashboard,
  liveMarkupBp,
  canEditLiveMarkup,
}: {
  dashboard: OwnerDashboard;
  liveMarkupBp: number;
  canEditLiveMarkup: boolean;
}) {
  const { kpis, gold, customers, trend } = dashboard;
  const salesSpark = trend.map((point) => point.salesRial);
  const profitSpark = trend.map((point) => point.profitRial);
  const goldSpark = trend.map((point) => point.goldMg);

  return (
    <div className="grid gap-6">
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

      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          قیمت گرم ۱۸ عیار{" "}
          {dashboard.goldPricePerGramRial !== null ? (
            <>
              <Money rial={dashboard.goldPricePerGramRial} />
              <span className="ms-2">
                <ChangeBadge bp={dashboard.goldPriceChangeBp} emptyLabel="رکورد قبلی نیست" />
              </span>
            </>
          ) : (
            <span className="text-destructive">ثبت نشده است</span>
          )}
        </p>
        <LiveMarkupForm markupBp={liveMarkupBp} canEdit={canEditLiveMarkup} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="فروش امروز"
          value={<Money rial={kpis.todaySalesRial} short />}
          hint={<ChangeBadge bp={kpis.todaySalesChangeBp} />}
          href="/admin/payments"
          sparkline={salesSpark}
        />
        <StatCard
          label="فروش این ماه"
          value={<Money rial={kpis.monthSalesRial} short />}
          hint={<ChangeBadge bp={kpis.monthSalesChangeBp} />}
          href="/admin/reports"
          sparkline={salesSpark}
        />
        <StatCard
          label="سود این ماه"
          value={<Money rial={kpis.monthProfitRial} short />}
          hint={<ChangeBadge bp={kpis.monthProfitChangeBp} />}
          href="/admin/reports"
          sparkline={profitSpark}
        />
        <StatCard
          label="ارزش موجودی فروشگاه"
          value={<Money rial={kpis.inventoryValueRial} short />}
          hint={
            <span>
              وزن انبار <GoldWeight mg={kpis.inventoryWeightMg} size="sm" />
            </span>
          }
          href="/admin/products"
          sparkline={goldSpark}
        />
      </div>

      <Section
        title="روند فروش"
        action={
          <div className="flex flex-wrap gap-1">
            {DASHBOARD_RANGES.map((range) => (
              <Link
                key={range}
                href={`/admin?range=${range}`}
                className={cn(
                  "rounded-full px-3 py-1 text-xs",
                  dashboard.range === range
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {DASHBOARD_RANGE_LABELS[range]}
              </Link>
            ))}
          </div>
        }
      >
        {trend.length === 0 ? (
          <p className="text-sm text-muted-foreground">در این بازه داده‌ای نیست.</p>
        ) : (
          <TrendChart points={trend} field="salesRial" label="فروش" />
        )}
      </Section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="نیازمند توجه">
          {dashboard.attention.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              در حال حاضر مورد مهمی برای توجه وجود ندارد.
            </p>
          ) : (
            <ul className="grid gap-1">
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

        <Section title="سفارش‌ها">
          <div className="grid grid-cols-2 gap-4">
            {dashboard.orders.map((row) => (
              <Metric key={row.key} label={row.label} value={toPersianDigits(row.count)} />
            ))}
          </div>
        </Section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="وضعیت طلای فروشگاه">
          <div className="grid grid-cols-2 gap-4">
            <Metric label="وزن انبار" value={<GoldWeight mg={gold.stockWeightMg} />} />
            <Metric label="ارزش انبار" value={<Money rial={gold.stockValueRial} short />} />
            <Metric label="طلای فروخته ۳۰ روز" value={<GoldWeight mg={gold.sold30dMg} />} />
            <Metric label="گردش موجودی" value={percentLabel(gold.turnoverBp)} />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            ورود انبار ثبت نمی‌شود؛ تغییر تقریبی برابر فروش ۳۰ روز است. گنجینهٔ کودک اینجا نیست.
          </p>
        </Section>

        <Section title="مشتریان">
          <div className="grid grid-cols-2 gap-4">
            <Metric label="جدید در ۳۰ روز" value={toPersianDigits(customers.newCount)} />
            <Metric label="تکراری" value={toPersianDigits(customers.repeatCount)} />
            <Metric label="نرخ تکرار" value={percentLabel(customers.repeatRateBp)} />
            <Metric
              label="میانگین سفارش"
              value={<Money rial={customers.averageOrderRial} short />}
            />
            <Metric
              label="ارزش طول عمر"
              value={<Money rial={customers.lifetimeValueRial} short />}
            />
            <Metric label="غیرفعال بیش از ۹۰ روز" value={toPersianDigits(customers.inactiveCount)} />
          </div>
        </Section>
      </div>

      <Section
        title="محصولات ۳۰ روز"
        action={
          <Link href="/admin/products" className="text-xs text-primary">
            مشاهده فهرست
          </Link>
        }
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <ProductList
            title="پرفروش"
            empty="فروشی در این بازه نیست."
            items={dashboard.topByQty.map((row) => ({
              title: row.title,
              detail: `${toPersianDigits(row.quantity)} عدد`,
            }))}
          />
          <ProductList
            title="سودآور"
            empty="سودی در این بازه نیست."
            items={dashboard.topByMargin.map((row) => ({
              title: row.title,
              detail: <Money rial={row.marginRial} short />,
            }))}
          />
        </div>
      </Section>

      <p className="text-xs text-muted-foreground">
        {dashboard.channelMessage} {dashboard.funnelMessage}
      </p>

      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {dashboard.areas.map((area) => (
          <li key={area.key} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={cn("size-2 rounded-full", healthDot(area.level))} />
            {area.label}
          </li>
        ))}
      </ul>
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
