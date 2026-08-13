"use client";

import { cn } from "@/shared/lib/cn";
import { formatJalaliShort } from "@/shared/lib/jalali";
import { toPersianDigits } from "@/shared/lib/persian";

import { detectScript, estimateEngravingFit } from "../domain/engraving";

/**
 * پیش‌نمایش حکاکی.
 *
 * پیش‌نمایش تایپوگرافیک است، نه رندر سه‌بعدی روی محصول (خارج از دامنه MVP،
 * docs/03-modules/personalization.md). هدف این است که کاربر قبل از خرید
 * ببیند متنش چطور می‌نشیند و بفهمد جا می‌شود یا نه.
 */
export function EngravingPreview({
  nameFa,
  nameEn,
  message,
  birthDateAt,
  maxChars,
  className,
}: {
  nameFa?: string;
  nameEn?: string;
  message?: string;
  birthDateAt?: number | null;
  maxChars: number;
  className?: string;
}) {
  const text = message ?? "";
  const fit = estimateEngravingFit(text, maxChars);
  const script = detectScript(text);

  return (
    <div className={cn("grid gap-3", className)}>
      <div className="relative overflow-hidden rounded-xl border border-gold/40 bg-gradient-to-b from-gold-soft/70 to-gold-soft/20 p-6 text-center">
        <p className="text-[11px] tracking-widest text-gold-deep/70">پیش‌نمایش حکاکی</p>

        <div className="mt-4 grid gap-1.5">
          {nameFa ? (
            <p className="text-2xl font-bold text-gold-deep sm:text-3xl">{nameFa}</p>
          ) : null}

          {nameEn ? (
            <p
              className="text-lg tracking-[0.25em] text-gold-deep/85"
              dir="ltr"
            >
              {nameEn.toUpperCase()}
            </p>
          ) : null}

          {birthDateAt ? (
            <p className="text-xs text-gold-deep/70">{formatJalaliShort(birthDateAt)}</p>
          ) : null}

          {text ? (
            <p
              className={cn(
                "mt-2 text-sm leading-relaxed text-gold-deep/90",
                script === "latin" && "tracking-wide",
              )}
              dir={script === "latin" ? "ltr" : "rtl"}
            >
              {text}
            </p>
          ) : null}

          {!nameFa && !nameEn && !text ? (
            <p className="py-4 text-sm text-gold-deep/60">
              نام یا پیام را وارد کنید تا پیش‌نمایش را ببینید.
            </p>
          ) : null}
        </div>
      </div>

      {maxChars > 0 ? (
        <p
          className={cn(
            "text-xs",
            fit.fits ? "text-muted-foreground" : "font-medium text-destructive",
          )}
        >
          {fit.fits
            ? `${toPersianDigits(fit.remainingChars)} کاراکتر ظرفیت باقی مانده است.`
            : "متن از ظرفیت حکاکی این محصول بیشتر است."}
        </p>
      ) : null}
    </div>
  );
}
