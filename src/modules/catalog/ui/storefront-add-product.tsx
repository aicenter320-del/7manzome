"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon, PlusIcon } from "lucide-react";

import { createProduct, createVariant } from "@/modules/catalog/actions/catalog.actions";
import { cta } from "@/shared/config/copy";
import { MG_PER_GRAM } from "@/shared/lib/gold";
import { slugify } from "@/shared/lib/persian";
import {
  PRODUCT_KIND_LABELS,
  PRODUCT_KINDS,
  type ProductKind,
} from "@/shared/types/enums";
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

/** افزودن قطعه از ویترین؛ بعد از ساخت به صفحهٔ همان قطعه با حالت ویرایش می‌رود. */
export function StorefrontAddProduct() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<ProductKind>("jewelry");
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button type="button" variant="gold" size="sm" onClick={() => setOpen(true)}>
        <PlusIcon />
        {cta.addProduct}
      </Button>
    );
  }

  return (
    <form
      className="grid gap-3 rounded-lg bg-card p-4 shadow-product sm:max-w-md"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = title.trim();
        if (trimmed.length < 2) {
          toast.error("عنوان باید حداقل دو حرف باشد.");
          return;
        }

        startTransition(async () => {
          const slugBase = slugify(trimmed);
          const slug = slugBase.length >= 2 ? slugBase : `piece-${Date.now()}`;
          const created = await createProduct({
            slug,
            title: trimmed,
            kind,
            brandLine: "standard",
          });
          if (!created.ok) {
            toast.error(created.error);
            return;
          }

          const variant = await createVariant({
            productId: created.data.productId,
            sku: `H${Date.now()}`,
            title: "۱ گرم ۱۸ عیار",
            weightMg: MG_PER_GRAM,
            karat: 18,
            stockQty: 0,
          });
          if (!variant.ok) {
            toast.error(variant.error);
            return;
          }

          toast.success("قطعه ساخته شد. جزئیات را روی همین صفحه کامل کنید.");
          router.push(`/products/${created.data.slug}?edit=1`);
        });
      }}
    >
      <FormField id="new-product-title" label="عنوان قطعه" required>
        <Input
          id="new-product-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </FormField>
      <FormField id="new-product-kind" label="نوع">
        <Select value={kind} onValueChange={(value) => setKind(value as ProductKind)}>
          <SelectTrigger id="new-product-kind">
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
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="gold" disabled={isPending}>
          {isPending ? <Loader2Icon className="animate-spin" /> : <PlusIcon />}
          ساخت و ویرایش
        </Button>
        <Button type="button" variant="ghost" disabled={isPending} onClick={() => setOpen(false)}>
          انصراف
        </Button>
      </div>
    </form>
  );
}
