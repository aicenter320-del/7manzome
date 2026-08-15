"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { XIcon } from "lucide-react";

import {
  attachProductOccasion,
  detachProductOccasion,
} from "@/modules/catalog/actions/catalog.actions";
import type { Occasion } from "@/modules/catalog/domain/types";
import { Badge } from "@/shared/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { useProductEdit } from "./product-edit-context";

/** چیپ مناسبت‌ها برای ویرایش روی ویترین. */
export function EditableProductOccasions({
  productId,
  attached,
  allOccasions,
}: {
  productId: string;
  attached: readonly Occasion[];
  allOccasions: readonly Occasion[];
}) {
  const { editing } = useProductEdit();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const attachedIds = new Set(attached.map((item) => item.id));
  const available = allOccasions.filter((item) => !attachedIds.has(item.id));

  if (!editing) return null;

  const toggle = (occasionId: string, next: boolean) => {
    startTransition(async () => {
      const result = next
        ? await attachProductOccasion({ productId, occasionId })
        : await detachProductOccasion({ productId, occasionId });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {attached.map((occasion) => (
        <Badge key={occasion.id} variant="gold" className="gap-1 pe-1">
          {occasion.title}
          <button
            type="button"
            aria-label={`حذف ${occasion.title}`}
            disabled={isPending}
            className="rounded-full p-0.5 hover:bg-gold/20"
            onClick={() => toggle(occasion.id, false)}
          >
            <XIcon className="size-3" />
          </button>
        </Badge>
      ))}
      {available.length > 0 ? (
        <Select
          disabled={isPending}
          onValueChange={(occasionId) => toggle(occasionId, true)}
        >
          <SelectTrigger className="h-8 w-auto min-w-36">
            <SelectValue placeholder="افزودن مناسبت" />
          </SelectTrigger>
          <SelectContent>
            {available.map((occasion) => (
              <SelectItem key={occasion.id} value={occasion.id}>
                {occasion.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  );
}
