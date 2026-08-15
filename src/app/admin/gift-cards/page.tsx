import { DataTable, GlassFilterPills, TableCell, TableRow } from "@/modules/admin";
import { listGiftCardsForAdmin } from "@/modules/gifting";
import {
  AssignGiftCardControl,
  MarkPrintedButton,
  VoidGiftCardButton,
} from "@/modules/gifting/ui/admin-gift-card-ops";
import { listTreasuresForAdmin } from "@/modules/treasury";
import { requirePermission } from "@/server/auth/guards";
import { formatJalaliDate } from "@/shared/lib/jalali";
import { GIFT_CARD_STATUS_LABELS, GIFT_CARD_STATUSES, type GiftCardStatus } from "@/shared/types/enums";
import { PageHeader } from "@/shared/ui/page-header";

import { CreateGiftCardsForm } from "./create-cards-form";

function parseStatus(value: string | undefined): GiftCardStatus | undefined {
  if (value && (GIFT_CARD_STATUSES as readonly string[]).includes(value)) {
    return value as GiftCardStatus;
  }
  return undefined;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function AdminGiftCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  await requirePermission("treasury:read");
  const status = parseStatus(firstParam((await searchParams).status));

  const [cards, treasures] = await Promise.all([
    listGiftCardsForAdmin({ ...(status ? { status } : {}), limit: 100 }),
    listTreasuresForAdmin(100),
  ]);

  const treasureOptions = treasures.map((item) => ({
    value: item.treasureId,
    label: `${item.title} — ${item.childFirstName}`,
  }));

  return (
    <div className="grid gap-8">
      <PageHeader title="کارت هدیه" description="انتساب به گنجینه، چاپ، QR لینک هدیه و ابطال." />

      <GlassFilterPills
        ariaLabel="وضعیت کارت هدیه"
        items={[
          { href: "/admin/gift-cards", label: "همه", isActive: !status },
          ...GIFT_CARD_STATUSES.map((item) => ({
            href: `/admin/gift-cards?status=${item}`,
            label: GIFT_CARD_STATUS_LABELS[item],
            isActive: status === item,
          })),
        ]}
      />

      <DataTable
        columns={["کد", "وضعیت", "گنجینه", "کودک", "ساخت", "عملیات"]}
        isEmpty={cards.length === 0}
        emptyTitle="کارتی در این وضعیت نیست"
      >
        {cards.map((card) => (
          <TableRow key={card.id}>
            <TableCell className="ltr-nums">{card.code}</TableCell>
            <TableCell>{GIFT_CARD_STATUS_LABELS[card.status]}</TableCell>
            <TableCell>{card.treasureTitle ?? "—"}</TableCell>
            <TableCell>{card.childFirstName ?? "—"}</TableCell>
            <TableCell>{formatJalaliDate(card.createdAt)}</TableCell>
            <TableCell>
              <div className="flex flex-wrap items-center gap-2">
                {card.status === "unassigned" ? (
                  <AssignGiftCardControl giftCardId={card.id} treasures={treasureOptions} />
                ) : null}
                {card.status === "unassigned" || card.status === "assigned" ? (
                  <MarkPrintedButton giftCardId={card.id} code={card.code} />
                ) : null}
                {card.giftLinkToken ? (
                  <a
                    href={`/api/qr/${card.giftLinkToken}`}
                    className="text-sm text-primary"
                    target="_blank"
                    rel="noreferrer"
                  >
                    QR
                  </a>
                ) : null}
                {card.status !== "void" ? (
                  <VoidGiftCardButton giftCardId={card.id} code={card.code} />
                ) : null}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </DataTable>

      <CreateGiftCardsForm />
    </div>
  );
}
