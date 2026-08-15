"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  assignGiftCardAction,
  markGiftCardPrintedAction,
  voidGiftCardAction,
} from "@/modules/gifting/actions/gifting.actions";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { SearchSelect, type SearchSelectOption } from "@/shared/ui/search-select";

export function AssignGiftCardControl({
  giftCardId,
  treasures,
}: {
  giftCardId: string;
  treasures: readonly SearchSelectOption[];
}) {
  const router = useRouter();
  const [treasureId, setTreasureId] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="min-w-48">
        <SearchSelect
          id={`treasure-${giftCardId}`}
          value={treasureId}
          onChange={setTreasureId}
          options={treasures}
          placeholder="گنجینه"
          aria-label="گنجینه مقصد کارت"
        />
      </div>
      <Button
        type="button"
        size="sm"
        disabled={isPending || !treasureId}
        onClick={() => {
          startTransition(async () => {
            const result = await assignGiftCardAction({ giftCardId, treasureId });
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("کارت به گنجینه وصل شد.");
            router.refresh();
          });
        }}
      >
        انتساب
      </Button>
    </div>
  );
}

export function GiftCardConfirmButton({
  label,
  title,
  description,
  variant = "outline",
  onConfirm,
}: {
  label: string;
  title: string;
  description: string;
  variant?: "outline" | "destructive";
  onConfirm: () => Promise<{ ok: true; data?: unknown } | { ok: false; error: string }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <Button type="button" size="sm" variant={variant} disabled={isPending} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!isPending) setOpen(next);
        }}
      >
        <DialogContent showCloseButton={!isPending}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant={variant === "destructive" ? "destructive" : "default"}
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  const result = await onConfirm();
                  if (!result.ok) {
                    toast.error(result.error);
                    setOpen(false);
                    return;
                  }
                  toast.success("انجام شد.");
                  setOpen(false);
                  router.refresh();
                });
              }}
            >
              تایید
            </Button>
            <Button type="button" variant="outline" disabled={isPending} onClick={() => setOpen(false)}>
              انصراف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function MarkPrintedButton({ giftCardId, code }: { giftCardId: string; code: string }) {
  return (
    <GiftCardConfirmButton
      label="چاپ‌شده"
      title="علامت چاپ"
      description={`کارت «${code}» چاپ‌شده علامت بخورد؟`}
      onConfirm={() => markGiftCardPrintedAction({ giftCardId })}
    />
  );
}

export function VoidGiftCardButton({ giftCardId, code }: { giftCardId: string; code: string }) {
  return (
    <GiftCardConfirmButton
      label="ابطال"
      title="ابطال کارت هدیه"
      description={`کارت «${code}» باطل شود؟`}
      variant="destructive"
      onConfirm={() => voidGiftCardAction({ giftCardId })}
    />
  );
}
