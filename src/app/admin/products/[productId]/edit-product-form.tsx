"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { setProductStatus, updateProduct } from "@/modules/catalog/actions/catalog.actions";
import type { ProductDetail } from "@/modules/catalog/domain/types";
import { toEnglishDigits } from "@/shared/lib/persian";
import {
  PRODUCT_STATUS_LABELS,
  PRODUCT_STATUSES,
  type ProductStatus,
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

export function EditProductForm({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<ProductStatus>(product.status);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="glass grid gap-4 rounded-3xl p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        const form = new FormData(event.currentTarget);
        const title = String(form.get("title") ?? "").trim();
        const subtitle = String(form.get("subtitle") ?? "").trim();
        const description = String(form.get("description") ?? "").trim();
        const sortRaw = Number(toEnglishDigits(String(form.get("sortOrder") ?? "0")));
        const sortOrder = Number.isFinite(sortRaw) ? sortRaw : 0;

        startTransition(async () => {
          const updated = await updateProduct({
            productId: product.id,
            title,
            ...(subtitle ? { subtitle } : { subtitle: "" }),
            ...(description ? { description } : { description: "" }),
            sortOrder,
          });
          if (!updated.ok) {
            setError(updated.error);
            return;
          }

          if (status !== product.status) {
            const changed = await setProductStatus({ productId: product.id, status });
            if (!changed.ok) {
              setError(changed.error);
              return;
            }
          }

          toast.success("مشخصات محصول ذخیره شد.");
          router.refresh();
        });
      }}
    >
      <h2 className="font-semibold">مشخصات</h2>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <FormField id="title" label="عنوان" required>
        <Input id="title" name="title" required defaultValue={product.title} />
      </FormField>

      <FormField id="subtitle" label="زیرعنوان">
        <Input id="subtitle" name="subtitle" defaultValue={product.subtitle ?? ""} />
      </FormField>

      <FormField id="description" label="توضیح">
        <Textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={product.description ?? ""}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="sortOrder"
          label="ترتیب نمایش"
          hint="عدد کوچک‌تر در ویترین زودتر دیده می‌شود."
        >
          <Input
            id="sortOrder"
            name="sortOrder"
            inputMode="numeric"
            className="ltr-nums"
            dir="ltr"
            defaultValue={String(product.sortOrder)}
          />
        </FormField>

        <FormField id="status" label="وضعیت">
          <Select value={status} onValueChange={(value) => setStatus(value as ProductStatus)}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {PRODUCT_STATUS_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2Icon className="animate-spin" /> : null}
        ذخیره مشخصات
      </Button>
    </form>
  );
}
