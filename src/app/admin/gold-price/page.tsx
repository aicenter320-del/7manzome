import { DataTable, TableCell, TableRow } from "@/modules/admin";
import {
  GoldPriceBadge,
  listGoldPriceHistory,
  tryGetCurrentGoldPrice,
} from "@/modules/pricing";
import { requirePermission } from "@/server/auth/guards";
import { formatJalaliDateTime } from "@/shared/lib/jalali";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";

import { SetGoldPriceForm } from "./set-price-form";

export default async function AdminGoldPricePage() {
  await requirePermission("gold_price:read");
  const [price18, price24, history18] = await Promise.all([
    tryGetCurrentGoldPrice(18),
    tryGetCurrentGoldPrice(24),
    listGoldPriceHistory(18, 20),
  ]);

  return (
    <div className="grid gap-8">
      <PageHeader title="قیمت طلا" description="بدون قیمت معتبر، فروش متوقف می‌شود." />

      <div className="flex flex-wrap gap-3">
        <GoldPriceBadge price={price18} />
        <GoldPriceBadge price={price24} />
      </div>

      <SetGoldPriceForm />

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">تاریخچه ۱۸ عیار</h2>
        <DataTable
          columns={["قیمت هر گرم", "منبع", "زمان"]}
          isEmpty={history18.length === 0}
          emptyTitle="تاریخچه‌ای نیست"
        >
          {history18.map((row, index) => (
            <TableRow key={`${row.effectiveAt}-${index}`}>
              <TableCell>
                <Money rial={row.pricePerGramRial} />
              </TableCell>
              <TableCell>{row.source === "manual" ? "دستی" : "بیرونی"}</TableCell>
              <TableCell>{formatJalaliDateTime(row.effectiveAt)}</TableCell>
            </TableRow>
          ))}
        </DataTable>
      </section>
    </div>
  );
}
