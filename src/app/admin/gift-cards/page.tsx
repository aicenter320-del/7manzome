import { DataTable, TableCell, TableRow } from "@/modules/admin";
import { listGiftCards } from "@/modules/gifting";
import { requirePermission } from "@/server/auth/guards";
import { formatJalaliDate } from "@/shared/lib/jalali";
import { env } from "@/shared/config/env";
import { PageHeader } from "@/shared/ui/page-header";

import { CreateGiftCardsForm } from "./create-cards-form";

const GIFT_CARD_STATUS_FA: Record<string, string> = {
  unassigned: "اختصاص‌نداده",
  assigned: "اختصاص‌داده‌شده",
  printed: "چاپ‌شده",
  redeemed: "استفاده‌شده",
  void: "باطل",
};

export default async function AdminGiftCardsPage() {
  await requirePermission("treasury:read");
  const cards = await listGiftCards({ limit: 50 });

  return (
    <div className="grid gap-8">
      <PageHeader title="کارت هدیه" description="کد و تصویر QR برای چاپ روی کارت فیزیکی." />

      <DataTable
        columns={["کد", "وضعیت", "ساخت"]}
        isEmpty={cards.length === 0}
        emptyTitle="کارتی ساخته نشده"
      >
        {cards.map((card) => (
          <TableRow key={card.id}>
            <TableCell className="ltr-nums">{card.code}</TableCell>
            <TableCell>{GIFT_CARD_STATUS_FA[card.status] ?? card.status}</TableCell>
            <TableCell>{formatJalaliDate(card.createdAt)}</TableCell>
          </TableRow>
        ))}
      </DataTable>

      <p className="text-xs text-muted-foreground">
        تصویر QR هر لینک هدیه از مسیر {`${env.APP_URL}/api/qr/`} به‌همراه توکن لینک ساخته می‌شود.
      </p>

      <CreateGiftCardsForm />
    </div>
  );
}
