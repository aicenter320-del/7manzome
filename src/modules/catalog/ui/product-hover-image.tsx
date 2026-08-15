import Image from "next/image";

import { cn } from "@/shared/lib/cn";

/** قاب تصویر محصول با تعویض عکس دوم فقط روی دستگاه‌های دارای موس. */
export function ProductHoverImage({
  heroFileId,
  hoverFileId,
  alt,
  sizes,
  priority = false,
  imageClassName,
}: {
  heroFileId: string | null;
  hoverFileId: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  imageClassName?: string;
}) {
  if (!heroFileId) {
    return (
      <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
        بدون تصویر
      </div>
    );
  }

  return (
    <>
      <Image
        src={`/api/files/${heroFileId}`}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-contain p-4", imageClassName)}
      />
      {hoverFileId ? (
        <Image
          src={`/api/files/${hoverFileId}`}
          alt=""
          fill
          sizes={sizes}
          className={cn("product-hover-swap object-contain p-4", imageClassName)}
        />
      ) : null}
    </>
  );
}
