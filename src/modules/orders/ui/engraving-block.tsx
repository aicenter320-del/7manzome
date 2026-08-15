"use client";

import { EngravingPreview } from "@/modules/personalization/ui/engraving-preview";
import { copy } from "@/shared/config/copy";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

/** فیلدهای حکاکی؛ زیر گالری می‌نشیند تا ستون خرید کوتاه بماند. */
export function EngravingBlock({
  nameFa,
  nameEn,
  message,
  maxChars,
  onNameFaChange,
  onNameEnChange,
  onMessageChange,
}: {
  nameFa: string;
  nameEn: string;
  message: string;
  maxChars: number;
  onNameFaChange: (value: string) => void;
  onNameEnChange: (value: string) => void;
  onMessageChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-4 rounded-lg bg-card p-5 shadow-product">
      <div className="grid gap-1">
        <p className="font-medium">{copy.productDetail.engravingTitle}</p>
        <p className="text-xs text-muted-foreground">{copy.productDetail.engravingHint}</p>
      </div>

      <FormField id="engravingNameFa" label="نام فارسی">
        <Input
          id="engravingNameFa"
          value={nameFa}
          onChange={(event) => onNameFaChange(event.target.value)}
          placeholder="آراد"
        />
      </FormField>

      <FormField id="engravingNameEn" label="نام لاتین">
        <Input
          id="engravingNameEn"
          dir="ltr"
          className="text-start"
          value={nameEn}
          onChange={(event) => onNameEnChange(event.target.value)}
          placeholder="ARAD"
        />
      </FormField>

      <FormField id="engravingMessage" label="پیام حکاکی">
        <Textarea
          id="engravingMessage"
          rows={3}
          maxLength={maxChars > 0 ? maxChars : undefined}
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
        />
      </FormField>

      <EngravingPreview nameFa={nameFa} nameEn={nameEn} message={message} maxChars={maxChars} />

      <p className="text-xs text-muted-foreground">{copy.productDetail.noReturn}</p>
    </div>
  );
}
