"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon, StarIcon, Trash2Icon, UploadIcon } from "lucide-react";

import {
  deleteProductMedia,
  setProductHero,
  uploadProductImage,
} from "@/modules/catalog/actions/catalog.actions";
import { MAX_PRODUCT_IMAGES } from "@/modules/catalog/domain/product-gallery";
import { customerImageSizes } from "@/shared/config/site";
import { cn } from "@/shared/lib/cn";
import { toPersianDigits } from "@/shared/lib/persian";
import { Button } from "@/shared/ui/button";

import { orderedGallery } from "../domain/product-gallery";
import type { ProductMediaItem } from "../domain/types";
import { useProductEdit } from "./product-edit-context";

/** گالری صفحهٔ جزئیات: صحنهٔ بزرگ و بندانگشتی‌های طلایی. */
export function ProductGallery({
  title,
  heroFileId,
  media,
  productId,
}: {
  title: string;
  heroFileId: string | null;
  media: readonly ProductMediaItem[];
  productId?: string;
}) {
  const { editing } = useProductEdit();
  const slides = orderedGallery(heroFileId, media);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = slides[activeIndex] ?? slides[0];
  const showEditor = Boolean(editing && productId);

  return (
    <div className="grid gap-3">
      <div className="product-card-wash relative aspect-square overflow-hidden rounded-lg">
        {active ? (
          <Image
            src={`/api/files/${active.fileId}`}
            alt={active.alt ?? title}
            fill
            sizes={customerImageSizes.column}
            className="object-contain p-8 sm:p-10"
            priority
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
            بدون تصویر
          </div>
        )}
      </div>

      {slides.length > 0 ? (
        <ul className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {slides.map((item, index) => (
            <li key={item.id} className="relative">
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`تصویر ${toPersianDigits(index + 1)}`}
                aria-current={index === activeIndex}
                className={cn(
                  "relative aspect-square w-full overflow-hidden rounded-lg bg-muted transition-shadow",
                  index === activeIndex
                    ? "ring-2 ring-gold ring-offset-2 ring-offset-background"
                    : "hover:ring-1 hover:ring-gold/50",
                )}
              >
                <Image
                  src={`/api/files/${item.fileId}`}
                  alt={item.alt ?? ""}
                  fill
                  sizes="96px"
                  className="object-contain p-1.5"
                />
              </button>
              {showEditor && productId ? (
                <GalleryThumbActions
                  productId={productId}
                  mediaId={item.id}
                  isHero={item.fileId === heroFileId}
                />
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {showEditor && productId ? (
        <GalleryUpload productId={productId} atLimit={media.length >= MAX_PRODUCT_IMAGES} />
      ) : null}
    </div>
  );
}

function GalleryThumbActions({
  productId,
  mediaId,
  isHero,
}: {
  productId: string;
  mediaId: string;
  isHero: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="absolute start-0 end-0 bottom-0 flex justify-center gap-0.5 rounded-b-lg bg-foreground/55 p-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-7 text-primary-foreground hover:bg-background/20"
        disabled={isPending || isHero}
        aria-label="تصویر اصلی"
        onClick={() => {
          startTransition(async () => {
            const result = await setProductHero({ productId, mediaId });
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            router.refresh();
          });
        }}
      >
        <StarIcon className={cn(isHero && "fill-current")} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-7 text-primary-foreground hover:bg-background/20"
        disabled={isPending}
        aria-label="حذف تصویر"
        onClick={() => {
          startTransition(async () => {
            const result = await deleteProductMedia({ mediaId });
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            router.refresh();
          });
        }}
      >
        <Trash2Icon />
      </Button>
    </div>
  );
}

function GalleryUpload({ productId, atLimit }: { productId: string; atLimit: boolean }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={atLimit || isPending}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          startTransition(async () => {
            const result = await uploadProductImage({ productId, file });
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("تصویر اضافه شد.");
            router.refresh();
          });
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={atLimit || isPending}
        onClick={() => fileRef.current?.click()}
      >
        {isPending ? <Loader2Icon className="animate-spin" /> : <UploadIcon />}
        افزودن عکس
      </Button>
    </div>
  );
}
