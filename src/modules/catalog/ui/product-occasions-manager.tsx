"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import {
  attachProductOccasion,
  detachProductOccasion,
} from "@/modules/catalog/actions/catalog.actions";
import type { Occasion } from "@/modules/catalog/domain/types";
import { Checkbox } from "@/shared/ui/checkbox";

export function ProductOccasionsManager({
  productId,
  attached,
  allOccasions,
  canWrite,
}: {
  productId: string;
  attached: readonly Occasion[];
  allOccasions: readonly Occasion[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const attachedIds = new Set(attached.map((item) => item.id));

  return (
    <section className="glass grid gap-4 rounded-3xl p-5">
      <div className="grid gap-1">
        <h2 className="font-semibold">مناسبت‌ها</h2>
        <p className="text-sm text-muted-foreground">
          روی صفحهٔ محصول به‌صورت برچسب دیده می‌شوند؛ مثل تولد یا دندان‌درآوردن.
        </p>
      </div>

      {allOccasions.length === 0 ? (
        <p className="text-sm text-muted-foreground">هنوز مناسبتی تعریف نشده است.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {allOccasions.map((occasion) => {
            const isOn = attachedIds.has(occasion.id);
            return (
              <li key={occasion.id}>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={isOn}
                    disabled={!canWrite || isPending}
                    onCheckedChange={(value) => {
                      const next = value === true;
                      startTransition(async () => {
                        const result = next
                          ? await attachProductOccasion({ productId, occasionId: occasion.id })
                          : await detachProductOccasion({ productId, occasionId: occasion.id });
                        if (!result.ok) {
                          toast.error(result.error);
                          return;
                        }
                        toast.success(next ? "مناسبت اضافه شد." : "مناسبت برداشته شد.");
                        router.refresh();
                      });
                    }}
                    aria-label={occasion.title}
                  />
                  <span>{occasion.title}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
