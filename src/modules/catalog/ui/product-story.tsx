"use client";

import { toast } from "sonner";

import { updateProduct } from "@/modules/catalog/actions/catalog.actions";
import { copy } from "@/shared/config/copy";

import { InlineTextField } from "./inline-text-field";
import { useProductEdit } from "./product-edit-context";

/** داستان و نکات قطعه؛ در حالت ویرایش با کلیک ذخیره می‌شود. */
export function ProductStory({
  productId,
  description,
  highlights,
}: {
  productId?: string;
  description: string | null;
  highlights: readonly string[];
}) {
  const { editing } = useProductEdit();

  if (!description && highlights.length === 0 && !editing) return null;

  const saveDescription = async (next: string) => {
    if (!productId) return;
    const result = await updateProduct({ productId, description: next });
    if (!result.ok) {
      toast.error(result.error);
      throw new Error(result.error);
    }
  };

  const saveHighlights = async (next: string) => {
    if (!productId) return;
    const items = next
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 6);
    const result = await updateProduct({ productId, highlights: items });
    if (!result.ok) {
      toast.error(result.error);
      throw new Error(result.error);
    }
  };

  return (
    <section className="grid gap-10 border-t border-gold/15 pt-12 lg:grid-cols-2 lg:gap-16">
      {editing || description ? (
        <div className="grid gap-3">
          <p className="flex items-center gap-3 text-xs font-medium tracking-wide text-gold-deep">
            <span className="h-px w-8 shrink-0 bg-gold" aria-hidden />
            {copy.productDetail.storyTitle}
          </p>
          {editing ? (
            <InlineTextField
              value={description ?? ""}
              placeholder="داستان این قطعه را بنویسید"
              multiline
              className="whitespace-pre-wrap leading-relaxed text-muted-foreground"
              onSave={saveDescription}
            />
          ) : (
            <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
      ) : null}

      {editing || highlights.length > 0 ? (
        <div className="grid gap-3">
          <p className="flex items-center gap-3 text-xs font-medium tracking-wide text-gold-deep">
            <span className="h-px w-8 shrink-0 bg-gold" aria-hidden />
            {copy.productDetail.highlightsTitle}
          </p>
          {editing ? (
            <InlineTextField
              value={highlights.join("\n")}
              placeholder="هر نکته در یک خط"
              multiline
              onSave={saveHighlights}
            />
          ) : (
            <ul className="grid gap-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-gold" aria-hidden />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  );
}
