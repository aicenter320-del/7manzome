import { getSalesReport, getTreasuryReport, StatCard } from "@/modules/admin";
import { requirePermission } from "@/server/auth/guards";
import { toPersianDigits } from "@/shared/lib/persian";
import { GoldWeight } from "@/shared/ui/gold-weight";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

export default async function AdminReportsPage() {
  await requirePermission("report:read");
  const [sales, treasury] = await Promise.all([getSalesReport(), getTreasuryReport()]);

  return (
    <div className="grid gap-8">
      <PageHeader title="گزارش‌ها" description="اعداد بر مبنای پرداخت تاییدشده و دفتر کل طلاست." />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="طلای ذخیره‌شده در گنجینه‌ها"
          value={<GoldWeight mg={treasury.totalGoldSavedMg} />}
          href="/admin/treasures"
        />
        <StatCard
          label="گنجینه‌های فعال"
          value={toPersianDigits(treasury.activeTreasureCount)}
          href="/admin/treasures"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>بازه</TableHead>
            <TableHead>مبلغ تاییدشده</TableHead>
            <TableHead>طلای فروخته</TableHead>
            <TableHead>سفارش</TableHead>
            <TableHead>هدیه</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((row) => (
            <TableRow key={row.periodLabel}>
              <TableCell>{row.periodLabel}</TableCell>
              <TableCell>
                <Money rial={row.confirmedAmountRial} />
              </TableCell>
              <TableCell>
                <GoldWeight mg={row.goldSoldMg} size="sm" />
              </TableCell>
              <TableCell>{toPersianDigits(row.orderCount)}</TableCell>
              <TableCell>{toPersianDigits(row.giftCount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
