"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { createVariant, updateVariant } from "@/modules/catalog/actions/catalog.actions";
import type { PricedVariant } from "@/modules/catalog/domain/types";
import { MG_PER_GRAM } from "@/shared/lib/gold";
import { toEnglishDigits } from "@/shared/lib/persian";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Money } from "@/shared/ui/money";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

function readInt(form: FormData, name: string, fallback = 0): number {
  const value = Number(toEnglishDigits(String(form.get(name) ?? String(fallback))));
  return Number.isFinite(value) ? value : fallback;
}

function VariantFields({
  prefix,
  karat,
  onKaratChange,
  defaults,
  includeSku,
}: {
  prefix: string;
  karat: "18" | "24";
  onKaratChange: (value: "18" | "24") => void;
  includeSku: boolean;
  defaults?: {
    sku: string;
    title: string;
    weightMg: number;
    stockQty: number;
    makingFeeBp: number;
    profitBp: number;
    packagingRial: number;
    premiumRial: number;
    engravingMaxChars: number;
  };
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {includeSku ? (
        <FormField id={`${prefix}-sku`} label="کد کالا" required>
          <Input
            id={`${prefix}-sku`}
            name="sku"
            dir="ltr"
            className="text-start"
            required
            defaultValue={defaults?.sku}
          />
        </FormField>
      ) : null}
      <FormField id={`${prefix}-title`} label="عنوان گونه" required>
        <Input
          id={`${prefix}-title`}
          name="title"
          required
          defaultValue={defaults?.title}
          placeholder="۰٫۸ گرم ۱۸ عیار"
        />
      </FormField>
      <FormField
        id={`${prefix}-weightMg`}
        label="وزن (میلی‌گرم)"
        hint={`هر گرم = ${MG_PER_GRAM} میلی‌گرم`}
        required
      >
        <Input
          id={`${prefix}-weightMg`}
          name="weightMg"
          inputMode="numeric"
          className="ltr-nums"
          dir="ltr"
          required
          defaultValue={defaults ? String(defaults.weightMg) : ""}
        />
      </FormField>
      <FormField id={`${prefix}-karat`} label="عیار">
        <Select value={karat} onValueChange={(value) => onKaratChange(value as "18" | "24")}>
          <SelectTrigger id={`${prefix}-karat`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="18">۱۸ عیار</SelectItem>
            <SelectItem value="24">۲۴ عیار</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      <FormField id={`${prefix}-stockQty`} label="موجودی">
        <Input
          id={`${prefix}-stockQty`}
          name="stockQty"
          inputMode="numeric"
          className="ltr-nums"
          dir="ltr"
          defaultValue={String(defaults?.stockQty ?? 1)}
        />
      </FormField>
      <FormField id={`${prefix}-makingFeeBp`} label="اجرت (صدم درصد)" hint="۱۲ درصد = ۱۲۰۰">
        <Input
          id={`${prefix}-makingFeeBp`}
          name="makingFeeBp"
          inputMode="numeric"
          className="ltr-nums"
          dir="ltr"
          defaultValue={String(defaults?.makingFeeBp ?? 0)}
        />
      </FormField>
      <FormField id={`${prefix}-profitBp`} label="سود (صدم درصد)" hint="۷ درصد = ۷۰۰">
        <Input
          id={`${prefix}-profitBp`}
          name="profitBp"
          inputMode="numeric"
          className="ltr-nums"
          dir="ltr"
          defaultValue={String(defaults?.profitBp ?? 0)}
        />
      </FormField>
      <FormField id={`${prefix}-packagingRial`} label="بسته‌بندی (ریال)">
        <Input
          id={`${prefix}-packagingRial`}
          name="packagingRial"
          inputMode="numeric"
          className="ltr-nums"
          dir="ltr"
          defaultValue={String(defaults?.packagingRial ?? 0)}
        />
      </FormField>
      <FormField id={`${prefix}-premiumRial`} label="حباب (ریال)" hint="برای سکه و شمش">
        <Input
          id={`${prefix}-premiumRial`}
          name="premiumRial"
          inputMode="numeric"
          className="ltr-nums"
          dir="ltr"
          defaultValue={String(defaults?.premiumRial ?? 0)}
        />
      </FormField>
      <FormField id={`${prefix}-engravingMaxChars`} label="حداکثر حرف حکاکی" hint="صفر یعنی حکاکی ندارد">
        <Input
          id={`${prefix}-engravingMaxChars`}
          name="engravingMaxChars"
          inputMode="numeric"
          className="ltr-nums"
          dir="ltr"
          defaultValue={String(defaults?.engravingMaxChars ?? 0)}
        />
      </FormField>
    </div>
  );
}

function VariantEditor({
  variant,
  canWrite,
}: {
  variant: PricedVariant;
  canWrite: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [karat, setKarat] = useState<"18" | "24">(variant.karat === 24 ? "24" : "18");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="grid gap-4 rounded-2xl bg-muted/40 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canWrite) return;
        setError(null);
        const form = new FormData(event.currentTarget);
        startTransition(async () => {
          const result = await updateVariant({
            variantId: variant.id,
            title: String(form.get("title") ?? "").trim(),
            weightMg: readInt(form, "weightMg"),
            karat: karat === "24" ? 24 : 18,
            stockQty: readInt(form, "stockQty"),
            makingFeeBp: readInt(form, "makingFeeBp"),
            profitBp: readInt(form, "profitBp"),
            packagingRial: readInt(form, "packagingRial"),
            premiumRial: readInt(form, "premiumRial"),
            engravingMaxChars: readInt(form, "engravingMaxChars"),
          });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          toast.success("گونه ذخیره شد.");
          router.refresh();
        });
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{variant.title}</p>
          {variant.isActive ? (
            <Badge variant="success">فعال</Badge>
          ) : (
            <Badge variant="muted">از فروشگاه برداشته‌شده</Badge>
          )}
        </div>
        {variant.price ? (
          <p className="text-sm text-muted-foreground">
            قیمت فعلی: <Money rial={variant.price.unitPriceRial} />
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">قیمت به‌زودی</p>
        )}
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <p className="text-xs text-muted-foreground">
        کد کالا: <span className="ltr-nums" dir="ltr">{variant.sku}</span>
      </p>

      <VariantFields
        prefix={variant.id}
        karat={karat}
        onKaratChange={setKarat}
        includeSku={false}
        defaults={{
          sku: variant.sku,
          title: variant.title,
          weightMg: variant.weightMg,
          stockQty: variant.stockQty,
          makingFeeBp: variant.makingFeeBp,
          profitBp: variant.profitBp,
          packagingRial: variant.packagingRial,
          premiumRial: variant.premiumRial,
          engravingMaxChars: variant.engravingMaxChars,
        }}
      />

      {canWrite ? (
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2Icon className="animate-spin" /> : null}
            ذخیره گونه
          </Button>
          <Button
            type="button"
            variant={variant.isActive ? "destructive" : "outline"}
            disabled={isPending}
            onClick={() => {
              if (
                variant.isActive &&
                !window.confirm("این گونه از فروشگاه برداشته شود؟ سفارش‌های قبلی حفظ می‌مانند.")
              ) {
                return;
              }
              startTransition(async () => {
                const result = await updateVariant({
                  variantId: variant.id,
                  isActive: !variant.isActive,
                });
                if (!result.ok) {
                  setError(result.error);
                  return;
                }
                toast.success(variant.isActive ? "گونه از فروشگاه برداشته شد." : "گونه دوباره فعال شد.");
                router.refresh();
              });
            }}
          >
            {variant.isActive ? "حذف از فروشگاه" : "فعال‌کردن دوباره"}
          </Button>
        </div>
      ) : null}
    </form>
  );
}

export function ProductVariantsManager({
  productId,
  variants,
  canWrite,
}: {
  productId: string;
  variants: readonly PricedVariant[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [karat, setKarat] = useState<"18" | "24">("18");
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="glass grid gap-5 rounded-3xl p-5">
      <div className="grid gap-1">
        <h2 className="font-semibold">گونه‌ها و قیمت</h2>
        <p className="text-sm text-muted-foreground">
          وزن، موجودی، اجرت و سود هر گونه را اینجا تنظیم کنید. قیمت نهایی از قیمت زنده طلا
          محاسبه می‌شود و در محصول ذخیره نمی‌شود.
        </p>
      </div>

      {variants.length === 0 ? (
        <p className="text-sm text-muted-foreground">هنوز گونه‌ای برای این محصول نیست.</p>
      ) : (
        <div className="grid gap-4">
          {variants.map((variant) => (
            <VariantEditor
              key={variant.id}
              variant={variant}
              canWrite={canWrite}
            />
          ))}
        </div>
      )}

      {canWrite ? (
        <form
          className="grid gap-4 border-t border-border pt-5"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            const form = event.currentTarget;
            const data = new FormData(form);
            startTransition(async () => {
              const result = await createVariant({
                productId,
                sku: String(data.get("sku") ?? "").trim(),
                title: String(data.get("title") ?? "").trim(),
                weightMg: readInt(data, "weightMg"),
                karat: karat === "24" ? 24 : 18,
                stockQty: readInt(data, "stockQty", 1),
                makingFeeBp: readInt(data, "makingFeeBp"),
                profitBp: readInt(data, "profitBp"),
                packagingRial: readInt(data, "packagingRial"),
                premiumRial: readInt(data, "premiumRial"),
                engravingMaxChars: readInt(data, "engravingMaxChars"),
              });
              if (!result.ok) {
                setError(result.error);
                return;
              }
              toast.success("گونه جدید اضافه شد.");
              form.reset();
              setKarat("18");
              router.refresh();
            });
          }}
        >
          <h3 className="font-medium">گونه جدید</h3>
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <VariantFields
            prefix="new"
            karat={karat}
            onKaratChange={setKarat}
            includeSku
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2Icon className="animate-spin" /> : null}
            افزودن گونه
          </Button>
        </form>
      ) : null}
    </section>
  );
}
