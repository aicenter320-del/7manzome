"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { EyeIcon, Loader2Icon, PencilIcon } from "lucide-react";

import { setProductStatus } from "@/modules/catalog/actions/catalog.actions";
import type { ProductDetail } from "@/modules/catalog/domain/types";
import { PRODUCT_STATUS_LABELS } from "@/shared/types/enums";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

import { useProductEdit } from "./product-edit-context";

/** نوار چسبان ویرایش برای کسی که catalog:write دارد. */
export function ProductEditBar({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const { editing, setEditing } = useProductEdit();
  const [isPending, startTransition] = useTransition();

  const publish = () => {
    startTransition(async () => {
      const result = await setProductStatus({ productId: product.id, status: "active" });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("قطعه روی ویترین منتشر شد.");
      router.refresh();
    });
  };

  return (
    <div className="sticky top-[calc(var(--site-header-height)+0.5rem)] z-30 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-card px-4 py-3 shadow-product">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={product.status === "active" ? "success" : "warning"}>
          {PRODUCT_STATUS_LABELS[product.status]}
        </Badge>
        <p className="text-sm font-medium">{editing ? "در حال ویرایش" : "مشاهده مثل مشتری"}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {product.status === "draft" ? (
          <Button type="button" size="sm" variant="gold" disabled={isPending} onClick={publish}>
            {isPending ? <Loader2Icon className="animate-spin" /> : null}
            انتشار
          </Button>
        ) : null}
        {editing ? (
          <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>
            <EyeIcon />
            مشاهده مثل مشتری
          </Button>
        ) : (
          <Button type="button" size="sm" variant="gold" onClick={() => setEditing(true)}>
            <PencilIcon />
            ویرایش
          </Button>
        )}
      </div>
    </div>
  );
}
