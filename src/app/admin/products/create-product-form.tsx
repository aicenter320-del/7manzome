"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { createProduct, createVariant } from "@/modules/catalog/actions/catalog.actions";
import { MG_PER_GRAM } from "@/shared/lib/gold";
import { toEnglishDigits } from "@/shared/lib/persian";
import {
  BRAND_LINES,
  PRODUCT_KIND_LABELS,
  PRODUCT_KINDS,
  type BrandLine,
  type ProductKind,
} from "@/shared/types/enums";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

export function CreateProductForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [kind, setKind] = useState<ProductKind>("jewelry");
  const [brandLine, setBrandLine] = useState<BrandLine>("standard");
  const [karat, setKarat] = useState<"18" | "24">("18");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="glass grid gap-4 rounded-3xl p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        const form = new FormData(event.currentTarget);
        const slug = String(form.get("slug") ?? "").trim();
        const title = String(form.get("title") ?? "").trim();
        const description = String(form.get("description") ?? "").trim();
        const sku = String(form.get("sku") ?? "").trim();
        const variantTitle = String(form.get("variantTitle") ?? "").trim();
        const weightMg = Number(toEnglishDigits(String(form.get("weightMg") ?? "")));
        const stockQty = Number(toEnglishDigits(String(form.get("stockQty") ?? "0")));
        const makingFeeBp = Number(toEnglishDigits(String(form.get("makingFeeBp") ?? "0")));
        const profitBp = Number(toEnglishDigits(String(form.get("profitBp") ?? "0")));

        startTransition(async () => {
          const created = await createProduct({
            slug,
            title,
            kind,
            brandLine,
            ...(description ? { description } : {}),
          });
          if (!created.ok) {
            setError(created.error);
            return;
          }

          const variant = await createVariant({
            productId: created.data.productId,
            sku,
            title: variantTitle || title,
            weightMg,
            karat: karat === "24" ? 24 : 18,
            makingFeeBp,
            profitBp,
            stockQty,
          });
          if (!variant.ok) {
            setError(variant.error);
            return;
          }

          toast.success("محصول و گونه اول ساخته شد.");
          router.refresh();
        });
      }}
    >
      <h2 className="font-semibold">محصول جدید</h2>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="title" label="عنوان" required>
          <Input id="title" name="title" required />
        </FormField>
        <FormField id="slug" label="نامک" required>
          <Input id="slug" name="slug" dir="ltr" className="text-start" required />
        </FormField>
      </div>

      <FormField id="kind" label="نوع">
        <Select value={kind} onValueChange={(value) => setKind(value as ProductKind)}>
          <SelectTrigger id="kind">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRODUCT_KINDS.map((value) => (
              <SelectItem key={value} value={value}>
                {PRODUCT_KIND_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField id="brandLine" label="خط برند">
        <Select value={brandLine} onValueChange={(value) => setBrandLine(value as BrandLine)}>
          <SelectTrigger id="brandLine">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BRAND_LINES.map((value) => (
              <SelectItem key={value} value={value}>
                {value === "signature" ? "اختصاصی هفت منظومه" : "استاندارد"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField id="description" label="توضیح">
        <Textarea id="description" name="description" rows={3} />
      </FormField>

      <p className="text-sm font-medium">گونه اول</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="sku" label="کد کالا" required>
          <Input id="sku" name="sku" dir="ltr" className="text-start" required />
        </FormField>
        <FormField id="variantTitle" label="عنوان گونه">
          <Input id="variantTitle" name="variantTitle" placeholder="۱ گرم ۱۸ عیار" />
        </FormField>
        <FormField id="weightMg" label="وزن (میلی‌گرم)" hint={`هر گرم = ${MG_PER_GRAM} میلی‌گرم`} required>
          <Input id="weightMg" name="weightMg" inputMode="numeric" className="ltr-nums" dir="ltr" required />
        </FormField>
        <FormField id="karat" label="عیار">
          <Select value={karat} onValueChange={(value) => setKarat(value as "18" | "24")}>
            <SelectTrigger id="karat">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="18">۱۸ عیار</SelectItem>
              <SelectItem value="24">۲۴ عیار</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField id="stockQty" label="موجودی">
          <Input id="stockQty" name="stockQty" inputMode="numeric" className="ltr-nums" dir="ltr" defaultValue="1" />
        </FormField>
        <FormField id="makingFeeBp" label="اجرت (صدم درصد)">
          <Input id="makingFeeBp" name="makingFeeBp" inputMode="numeric" className="ltr-nums" dir="ltr" defaultValue="0" />
        </FormField>
        <FormField id="profitBp" label="سود (صدم درصد)">
          <Input id="profitBp" name="profitBp" inputMode="numeric" className="ltr-nums" dir="ltr" defaultValue="0" />
        </FormField>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2Icon className="animate-spin" /> : null}
        ثبت محصول
      </Button>
    </form>
  );
}
