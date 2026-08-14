"use client";

import Link from "next/link";

import {
  adminCloseGiftLink,
  adminPauseGiftLink,
  adminResumeGiftLink,
  adminVoidGiftCard,
} from "@/modules/admin/actions/admin.actions";
import {
  GIFT_CARD_STATUS_LABELS,
  GIFT_LINK_STATUS_LABELS,
  type GiftCardStatus,
  type GiftLinkStatus,
} from "@/shared/types/enums";
import { Badge } from "@/shared/ui/badge";
import { EmptyState } from "@/shared/ui/empty-state";

import { ConfirmActionButton } from "./confirm-action-button";

export interface AdminGiftLinkRow {
  id: string;
  title: string;
  status: GiftLinkStatus;
  url: string;
}

export interface AdminGiftCardRow {
  id: string;
  code: string;
  status: GiftCardStatus;
}

export function AdminGiftsPanel({
  userId,
  links,
  cards,
  canWrite,
}: {
  userId: string;
  links: AdminGiftLinkRow[];
  cards: AdminGiftCardRow[];
  canWrite: boolean;
}) {
  if (links.length === 0 && cards.length === 0) {
    return <EmptyState title="لینک یا کارت هدیه‌ای ثبت نشده" />;
  }

  return (
    <div className="grid gap-8">
      <section className="grid gap-3">
        <h3 className="font-medium">لینک هدیه</h3>
        {links.length === 0 ? (
          <p className="text-sm text-muted-foreground">لینکی ساخته نشده.</p>
        ) : (
          <ul className="grid gap-3">
            {links.map((link) => (
              <li
                key={link.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl glass p-4"
              >
                <div className="grid gap-1">
                  <p>{link.title}</p>
                  <Link
                    href={link.url}
                    className="text-sm text-muted-foreground hover:underline"
                    target="_blank"
                  >
                    صفحه عمومی
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="muted">{GIFT_LINK_STATUS_LABELS[link.status]}</Badge>
                  {canWrite && link.status === "active" ? (
                    <ConfirmActionButton
                      label="توقف"
                      title="توقف لینک هدیه"
                      description={`لینک «${link.title}» موقتاً متوقف شود؟`}
                      onConfirm={() => adminPauseGiftLink({ userId, giftLinkId: link.id })}
                    />
                  ) : null}
                  {canWrite && link.status === "paused" ? (
                    <ConfirmActionButton
                      label="ازسرگیری"
                      title="فعال‌کردن دوباره لینک"
                      description={`لینک «${link.title}» دوباره فعال شود؟`}
                      onConfirm={() => adminResumeGiftLink({ userId, giftLinkId: link.id })}
                    />
                  ) : null}
                  {canWrite && (link.status === "active" || link.status === "paused") ? (
                    <ConfirmActionButton
                      label="بستن"
                      title="بستن لینک هدیه"
                      description={`لینک «${link.title}» بسته شود؟`}
                      variant="destructive"
                      onConfirm={() => adminCloseGiftLink({ userId, giftLinkId: link.id })}
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-3">
        <h3 className="font-medium">کارت هدیه</h3>
        {cards.length === 0 ? (
          <p className="text-sm text-muted-foreground">کارتی منسوب یا ساخته‌شده نیست.</p>
        ) : (
          <ul className="grid gap-3">
            {cards.map((card) => (
              <li
                key={card.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl glass p-4"
              >
                <p className="ltr-nums font-medium" dir="ltr">
                  {card.code}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="muted">{GIFT_CARD_STATUS_LABELS[card.status]}</Badge>
                  {canWrite && card.status !== "void" ? (
                    <ConfirmActionButton
                      label="ابطال"
                      title="ابطال کارت هدیه"
                      description={`کارت «${card.code}» باطل شود؟`}
                      variant="destructive"
                      onConfirm={() => adminVoidGiftCard({ userId, giftCardId: card.id })}
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
