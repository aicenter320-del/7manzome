"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon, PlusIcon } from "lucide-react";

import { createVariant, updateVariant } from "@/modules/catalog/actions/catalog.actions";
import type { PricedVariant } from "@/modules/catalog/domain/types";
import { MG_PER_GRAM, gramToMg, mgToGram } from "@/shared/lib/gold";
import { toEnglishDigits } from "@/shared/lib/persian";
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

import { useProductEdit } from "./product-edit-context";

const BP_PER_PERCENT = 100;

function parseGramsToMg(raw: string): number | null {
  const n = Number(toEnglishDigits(raw));
  if (!Number.isFinite(n) || n <= 0) return null;
  return gramToMg(n);
}

function parsePercentToBp(raw: string): number | null {
  const n = Number(toEnglishDigits(raw));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * BP_PER_PERCENT);
}

function parseIntInput(raw: string): number | null {
  const n = Number(toEnglishDigits(raw));
  if (!Number.isInteger(n) || n < 0) return null;
  return n;
}

function formatPercent(bp: number): string {
  return String(bp / BP_PER_PERCENT);
}

/** ویرایش گونه با واحد نمایشی گرم و درصد؛ قیمت واحد تایپ نمی‌شود. */
export function EditableProductVariants({
  productId,
  variants,
}: {
  productId: string;
  variants: readonly PricedVariant[];
}) {
  const { editing } = useProductEdit();
  if (!editing) return null;

  return (
    <div className="grid gap-4">
      {variants.map((variant) => (
        <VariantEditor key={variant.id} variant={variant} />
      ))}
      <AddVariantButton productId={productId} />
    </div>
  );
}

function VariantEditor({ variant }: { variant: PricedVariant }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [weightG, setWeightG] = useState(String(mgToGram(variant.weightMg)));
  const [makingPct, setMakingPct] = useState(formatPercent(variant.makingFeeBp));
  const [profitPct, setProfitPct] = useState(formatPercent(variant.profitBp));
  const [stock, setStock] = useState(String(variant.stockQty));
  const [karat, setKarat] = useState<"18" | "24">(variant.karat === 24 ? "24" : "18");

  const save = () => {
    const weightMg = parseGramsToMg(weightG);
    const makingFeeBp = parsePercentToBp(makingPct);
    const profitBp = parsePercentToBp(profitPct);
    const stockQty = parseIntInput(stock);

    if (weightMg === null || makingFeeBp === null || profitBp === null || stockQty === null) {
      toast.error("وزن، اجرت، سود و موجودی را درست وارد کنید.");
      return;
    }

    startTransition(async () => {
      const result = await updateVariant({
        variantId: variant.id,
        title: variant.title,
        weightMg,
        karat: karat === "24" ? 24 : 18,
        makingFeeBp,
        profitBp,
        stockQty,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("گونه ذخیره شد.");
      router.refresh();
    });
  };

  return (
    <div className="grid gap-3 rounded-lg bg-card p-4 shadow-product">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium">{variant.title}</p>
        {variant.price ? (
          <p className="text-sm font-semibold text-gold-deep">
            <Money rial={variant.price.unitPriceRial} />
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">قیمت از وزن و اجرت محاسبه می‌شود</p>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField id={`w-${variant.id}`} label="وزن (گرم)">
          <Input
            id={`w-${variant.id}`}
            inputMode="decimal"
            className="ltr-nums"
            dir="ltr"
            value={weightG}
            onChange={(event) => setWeightG(event.target.value)}
            onBlur={save}
          />
        </FormField>
        <FormField id={`k-${variant.id}`} label="عیار">
          <Select
            value={karat}
            onValueChange={(value) => {
              setKarat(value as "18" | "24");
              startTransition(async () => {
                const result = await updateVariant({
                  variantId: variant.id,
                  title: variant.title,
                  karat: value === "24" ? 24 : 18,
                });
                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }
                router.refresh();
              });
            }}
          >
            <SelectTrigger id={`k-${variant.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="18">۱۸ عیار</SelectItem>
              <SelectItem value="24">۲۴ عیار</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField id={`m-${variant.id}`} label="اجرت (درصد)">
          <Input
            id={`m-${variant.id}`}
            inputMode="decimal"
            className="ltr-nums"
            dir="ltr"
            value={makingPct}
            onChange={(event) => setMakingPct(event.target.value)}
            onBlur={save}
          />
        </FormField>
        <FormField id={`p-${variant.id}`} label="سود (درصد)">
          <Input
            id={`p-${variant.id}`}
            inputMode="decimal"
            className="ltr-nums"
            dir="ltr"
            value={profitPct}
            onChange={(event) => setProfitPct(event.target.value)}
            onBlur={save}
          />
        </FormField>
        <FormField id={`s-${variant.id}`} label="موجودی">
          <Input
            id={`s-${variant.id}`}
            inputMode="numeric"
            className="ltr-nums"
            dir="ltr"
            value={stock}
            onChange={(event) => setStock(event.target.value)}
            onBlur={save}
          />
        </FormField>
      </div>
      {isPending ? (
        <p className="text-xs text-muted-foreground">
          <Loader2Icon className="me-1 inline size-3 animate-spin" />
          ذخیره…
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">قیمت واحد از وزن و اجرت به‌دست می‌آید و تایپ نمی‌شود.</p>
      )}
    </div>
  );
}

function AddVariantButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const sku = `H${Date.now()}`;
          const result = await createVariant({
            productId,
            sku,
            title: "۱ گرم ۱۸ عیار",
            weightMg: MG_PER_GRAM,
            karat: 18,
            stockQty: 0,
          });
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("گونه جدید اضافه شد.");
          router.refresh();
        });
      }}
    >
      {isPending ? <Loader2Icon className="animate-spin" /> : <PlusIcon />}
      افزودن گونه
    </Button>
  );
}
