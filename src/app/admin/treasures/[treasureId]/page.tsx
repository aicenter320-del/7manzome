import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { DataTable, TableCell, TableRow } from "@/modules/admin";
import {
  getGiftLinksForTreasureUnchecked,
  listContributionsForAdmin,
} from "@/modules/gifting";
import { getTreasureSummaryUnchecked } from "@/modules/treasury";
import { requirePermission } from "@/server/auth/guards";
import { formatJalaliDate } from "@/shared/lib/jalali";
import { toPersianDigits } from "@/shared/lib/persian";
import { CONTRIBUTION_STATUS_LABELS, GIFT_LINK_STATUS_LABELS } from "@/shared/types/enums";
import { GoldWeight } from "@/shared/ui/gold-weight";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";

export default async function AdminTreasureDetailPage({
  params,
}: {
  params: Promise<{ treasureId: string }>;
}) {
  await requirePermission("treasury:read");
  const { treasureId } = await params;
  const summary = await getTreasureSummaryUnchecked(treasureId);
  if (!summary) notFound();

  const [contributions, links] = await Promise.all([
    listContributionsForAdmin(treasureId),
    getGiftLinksForTreasureUnchecked(treasureId),
  ]);

  return (
    <div className="grid gap-8">
      <PageHeader
        title={summary.treasure.title}
        description={`${summary.child.firstName} — ${summary.child.ageLabel}`}
        actions={
          <Link href="/admin/treasures" className="text-sm text-primary">
            بازگشت به فهرست
          </Link>
        }
      />

      <div className="glass grid gap-2 rounded-3xl p-5 sm:grid-cols-3">
        <Metric label="موجودی" value={<GoldWeight mg={summary.balance.balanceMg} />} />
        <Metric
          label="ارزش امروز"
          value={
            summary.currentValueRial !== null ? <Money rial={summary.currentValueRial} /> : "قیمت طلا نیست"
          }
        />
        <Metric label="هدیه‌دهنده" value={toPersianDigits(summary.contributorCount)} />
      </div>

      <section className="grid gap-3">
        <h2 className="font-semibold">لینک هدیه</h2>
        {links.length === 0 ? (
          <p className="text-sm text-muted-foreground">لینک هدیه‌ای ساخته نشده.</p>
        ) : (
          <ul className="grid gap-3">
            {links.map((link) => (
              <li
                key={link.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl glass p-4"
              >
                <div className="grid gap-1">
                  <p>{link.title}</p>
                  <Link href={link.url} className="text-sm text-muted-foreground hover:underline" target="_blank">
                    صفحه عمومی
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground">{GIFT_LINK_STATUS_LABELS[link.status]}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="font-semibold">مشارکت‌ها</h2>
        <DataTable
          columns={["هدیه‌دهنده", "مبلغ", "طلا", "وضعیت", "تاریخ"]}
          isEmpty={contributions.length === 0}
          emptyTitle="مشارکتی ثبت نشده"
        >
          {contributions.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.isAnonymous ? "ناشناس برای مهمان" : item.contributorName}</TableCell>
              <TableCell>
                <Money rial={item.amountRial} />
              </TableCell>
              <TableCell>
                {item.goldMg !== null ? <GoldWeight mg={item.goldMg} size="sm" /> : "—"}
              </TableCell>
              <TableCell>{CONTRIBUTION_STATUS_LABELS[item.status]}</TableCell>
              <TableCell>{formatJalaliDate(item.confirmedAt ?? item.createdAt)}</TableCell>
            </TableRow>
          ))}
        </DataTable>
      </section>
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
