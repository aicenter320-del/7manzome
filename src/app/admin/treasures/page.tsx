import Link from "next/link";

import { DataTable, TableCell, TableRow } from "@/modules/admin";
import {
  getGoldCoverSummary,
  listGoldCoverEntries,
  listTreasuresForAdmin,
} from "@/modules/treasury";
import { RecordGoldCoverForm } from "@/modules/treasury/ui/record-gold-cover-form";
import { requirePermission } from "@/server/auth/guards";
import { hasPermission } from "@/server/auth/rbac";
import { formatJalaliDate } from "@/shared/lib/jalali";
import { formatPhoneFa, toPersianDigits } from "@/shared/lib/persian";
import { GOLD_COVER_SOURCE_LABELS } from "@/shared/types/enums";
import { GoldWeight } from "@/shared/ui/gold-weight";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";

export default async function AdminTreasuresPage() {
  const user = await requirePermission("treasury:read");
  const canAdjust = hasPermission(user.roles, "treasury:adjust");

  const [cover, treasures, purchases] = await Promise.all([
    getGoldCoverSummary(),
    listTreasuresForAdmin(),
    listGoldCoverEntries(20),
  ]);

  return (
    <div className="grid gap-8">
      <PageHeader
        title="گنجینه‌ها"
        description="تعهد دفتر کل کودک و طلایی که فروشگاه باید از بازار بخرد."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <CoverMetric label="تعهد گنجینه" mg={cover.obligationMg} hint="معادل عیار ۱۸" />
        <CoverMetric label="پوشش خریده‌شده" mg={cover.coveredMg} hint="طلای ثبت‌شده فروشگاه" />
        <CoverMetric
          label="باید بخرید"
          mg={cover.remainingMg}
          hint={cover.surplusPureMg > 0 ? "خرید بیشتر از تعهد ثبت شده" : "تعهد منهای پوشش"}
          emphasis={cover.remainingMg > 0}
        />
      </div>

      <DataTable
        columns={["گنجینه", "کودک", "دارنده", "موجودی", "آخرین مشارکت"]}
        isEmpty={treasures.length === 0}
        emptyTitle="گنجینهٔ فعالی نیست"
      >
        {treasures.map((item) => (
          <TableRow key={item.treasureId}>
            <TableCell>
              <Link href={`/admin/treasures/${item.treasureId}`} className="text-primary">
                {item.title}
              </Link>
            </TableCell>
            <TableCell>{item.childFirstName}</TableCell>
            <TableCell>
              <Link href={`/admin/users/${item.ownerUserId}`} className="hover:underline">
                {item.ownerDisplayName}
              </Link>
              <p className="ltr-nums text-xs text-muted-foreground">{formatPhoneFa(item.ownerPhone)}</p>
            </TableCell>
            <TableCell>
              <GoldWeight mg={item.balanceMg} size="sm" />
            </TableCell>
            <TableCell>
              {item.lastContributionAt ? formatJalaliDate(item.lastContributionAt) : "—"}
            </TableCell>
          </TableRow>
        ))}
      </DataTable>

      {canAdjust ? <RecordGoldCoverForm /> : null}

      <section className="grid gap-3">
        <h2 className="font-semibold">خریدهای پوشش</h2>
        <DataTable
          columns={["تاریخ", "وزن", "عیار", "منبع", "مبلغ"]}
          isEmpty={purchases.length === 0}
          emptyTitle="خرید پوششی ثبت نشده"
        >
          {purchases.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{formatJalaliDate(entry.purchasedAt)}</TableCell>
              <TableCell>
                <GoldWeight mg={entry.amountMg} size="sm" />
              </TableCell>
              <TableCell>{toPersianDigits(entry.karat)}</TableCell>
              <TableCell>{GOLD_COVER_SOURCE_LABELS[entry.source]}</TableCell>
              <TableCell>
                {entry.paidRial !== null ? <Money rial={entry.paidRial} /> : "—"}
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
      </section>
    </div>
  );
}

function CoverMetric({
  label,
  mg,
  hint,
  emphasis = false,
}: {
  label: string;
  mg: number;
  hint: string;
  emphasis?: boolean;
}) {
  return (
    <div className="glass rounded-3xl p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className={emphasis && mg > 0 ? "mt-2 text-destructive" : "mt-2"}>
        <GoldWeight mg={mg} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
