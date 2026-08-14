"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { updateSetting } from "@/modules/content/actions/content.actions";
import {
  liveMarkupBpToPercent,
  liveMarkupPercentToBp,
  MAX_LIVE_GOLD_MARKUP_PERCENT,
} from "@/modules/pricing/domain/live-gold-quote";
import { toEnglishDigits, toPersianDigits } from "@/shared/lib/persian";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

export function LiveMarkupForm({
  markupBp,
  canEdit,
}: {
  markupBp: number;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [percent, setPercent] = useState(() =>
    toPersianDigits(liveMarkupBpToPercent(markupBp)),
  );

  if (!canEdit) {
    return (
      <p className="text-sm text-muted-foreground">
        درصد افزوده روی قیمت زنده {toPersianDigits(liveMarkupBpToPercent(markupBp))}٪
      </p>
    );
  }

  return (
    <form
      className="grid gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = Number(toEnglishDigits(percent));
        if (
          !Number.isInteger(parsed) ||
          parsed < 0 ||
          parsed > MAX_LIVE_GOLD_MARKUP_PERCENT
        ) {
          toast.error("درصد باید عدد صحیح بین ۰ و ۲۰ باشد.");
          return;
        }

        startTransition(async () => {
          const result = await updateSetting({
            key: "pricing.live_markup_bp",
            value: liveMarkupPercentToBp(parsed),
          });
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("درصد افزوده ذخیره شد.");
          router.refresh();
        });
      }}
    >
      <FormField
        id="live-markup-percent"
        label="درصد افزوده روی قیمت زنده"
        hint="مثلاً ۱ در روز عادی و ۲ در تعطیل"
      >
        <div className="flex items-center gap-2">
          <Input
            id="live-markup-percent"
            value={percent}
            onChange={(event) => {
              const digits = toEnglishDigits(event.target.value).replace(/[^\d]/g, "");
              setPercent(digits === "" ? "" : toPersianDigits(digits));
            }}
            inputMode="numeric"
            className="w-24 text-start"
            dir="rtl"
          />
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? <Loader2Icon className="animate-spin" /> : null}
            ذخیره
          </Button>
        </div>
      </FormField>
    </form>
  );
}
