"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2Icon,
  StarIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";

import {
  deleteProductMedia,
  reorderProductMedia,
  setProductHero,
  uploadProductImage,
} from "@/modules/catalog/actions/catalog.actions";
import { MAX_PRODUCT_IMAGES } from "@/modules/catalog/domain/product-gallery";
import type { ProductMediaItem } from "@/modules/catalog/domain/types";
import { cn } from "@/shared/lib/cn";
import { toPersianDigits } from "@/shared/lib/persian";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

export function ProductGalleryManager({
  productId,
  heroFileId,
  media,
  canWrite,
}: {
  productId: string;
  heroFileId: string | null;
  media: readonly ProductMediaItem[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [setAsHero, setSetAsHero] = useState(false);
  const atLimit = media.length >= MAX_PRODUCT_IMAGES;

  function refreshAfter(result: { ok: true } | { ok: false; error: string }, success: string) {
    if (!result.ok) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    setError(null);
    toast.success(success);
    router.refresh();
  }

  return (
    <section className="glass grid gap-4 rounded-3xl p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <h2 className="font-semibold">گالری تصاویر</h2>
          <p className="text-sm text-muted-foreground">
            حداکثر {toPersianDigits(MAX_PRODUCT_IMAGES)} تصویر. تصویر دوم در ویترین با بردن موس
            روی کارت دیده می‌شود.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {toPersianDigits(media.length)} از {toPersianDigits(MAX_PRODUCT_IMAGES)}
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {media.length === 0 ? (
        <p className="text-sm text-muted-foreground">هنوز تصویری برای این محصول نیست.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((item, index) => {
            const isHero = item.fileId === heroFileId;
            return (
              <li key={item.id} className="grid gap-2 rounded-2xl bg-muted/40 p-2">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/files/${item.fileId}`}
                    alt={item.alt ?? ""}
                    className="size-full object-contain p-2"
                  />
                  {isHero ? (
                    <Badge variant="gold" className="absolute start-2 top-2">
                      تصویر اصلی
                    </Badge>
                  ) : null}
                </div>
                {canWrite ? (
                  <div className="flex flex-wrap gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={isPending || index === 0}
                      aria-label="جابه‌جایی به قبل"
                      onClick={() => {
                        const next = [...media];
                        const previous = next[index - 1];
                        const current = next[index];
                        if (!previous || !current) return;
                        next[index - 1] = current;
                        next[index] = previous;
                        startTransition(async () => {
                          const result = await reorderProductMedia({
                            productId,
                            mediaIds: next.map((row) => row.id),
                          });
                          refreshAfter(result, "ترتیب تصاویر ذخیره شد.");
                        });
                      }}
                    >
                      <ChevronUpIcon />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={isPending || index === media.length - 1}
                      aria-label="جابه‌جایی به بعد"
                      onClick={() => {
                        const next = [...media];
                        const following = next[index + 1];
                        const current = next[index];
                        if (!following || !current) return;
                        next[index + 1] = current;
                        next[index] = following;
                        startTransition(async () => {
                          const result = await reorderProductMedia({
                            productId,
                            mediaIds: next.map((row) => row.id),
                          });
                          refreshAfter(result, "ترتیب تصاویر ذخیره شد.");
                        });
                      }}
                    >
                      <ChevronDownIcon />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={isPending || isHero}
                      aria-label="تعیین تصویر اصلی"
                      onClick={() => {
                        startTransition(async () => {
                          const result = await setProductHero({ productId, mediaId: item.id });
                          refreshAfter(result, "تصویر اصلی به‌روز شد.");
                        });
                      }}
                    >
                      <StarIcon className={cn(isHero && "fill-current")} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={isPending}
                      aria-label="حذف تصویر"
                      onClick={() => {
                        if (!window.confirm("این تصویر از گالری محصول حذف شود؟")) return;
                        startTransition(async () => {
                          const result = await deleteProductMedia({ mediaId: item.id });
                          refreshAfter(result, "تصویر حذف شد.");
                        });
                      }}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {canWrite ? (
        <form
          className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const files = fileRef.current?.files;
            if (!files || files.length === 0) {
              setError("فایل تصویر را انتخاب کنید.");
              return;
            }

            const selected = Array.from(files);
            const makeHero = setAsHero;

            startTransition(async () => {
              for (const [index, file] of selected.entries()) {
                const result = await uploadProductImage({
                  productId,
                  file,
                  setAsHero: makeHero && index === 0,
                });
                if (!result.ok) {
                  setError(result.error);
                  toast.error(result.error);
                  return;
                }
              }
              setError(null);
              setSetAsHero(false);
              toast.success("تصویرها اضافه شدند.");
              form.reset();
              router.refresh();
            });
          }}
        >
          <FormField
            id="product-images"
            label="افزودن تصویر"
            hint="jpeg، png یا webp؛ می‌توانید چند فایل یکجا انتخاب کنید."
          >
            <Input
              ref={fileRef}
              id="product-images"
              name="files"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={isPending || atLimit}
            />
          </FormField>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={setAsHero}
                onCheckedChange={(value) => setSetAsHero(value === true)}
                disabled={isPending || atLimit}
                aria-label="تصویر اصلی باشد"
              />
              تصویر اصلی باشد
            </label>
            <Button type="submit" disabled={isPending || atLimit}>
              {isPending ? <Loader2Icon className="animate-spin" /> : <UploadIcon />}
              بارگذاری
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
