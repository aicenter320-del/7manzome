import type { ProductMediaItem } from "./types";

/** سقف تصاویر گالری هر محصول. */
export const MAX_PRODUCT_IMAGES = 8;

/** اولین تصویر گالری که با تصویر اصلی فرق دارد؛ برای تعویض هنگام hover. */
export function hoverFileId(
  heroFileId: string | null,
  media: readonly { fileId: string }[],
): string | null {
  const primary = heroFileId ?? media[0]?.fileId ?? null;
  if (!primary) return null;

  return media.find((item) => item.fileId !== primary)?.fileId ?? null;
}

/**
 * ترتیب نمایش گالری: تصویر اصلی اول، بقیه به ترتیب ذخیره‌شده.
 * اگر تصویر اصلی در گالری نباشد، همان ترتیب گالری برمی‌گردد.
 */
export function orderedGallery<T extends { fileId: string }>(
  heroFileId: string | null,
  media: readonly T[],
): T[] {
  if (!heroFileId || media.length === 0) return [...media];

  const heroIndex = media.findIndex((item) => item.fileId === heroFileId);
  if (heroIndex <= 0) return [...media];

  const hero = media[heroIndex];
  if (!hero) return [...media];

  return [hero, ...media.filter((_, index) => index !== heroIndex)];
}

/** پس از حذف تصویر اصلی، اولین باقی‌مانده هیرو می‌شود. */
export function nextHeroFileId(
  remaining: readonly { fileId: string }[],
): string | null {
  return remaining[0]?.fileId ?? null;
}

export function canAddProductImage(currentCount: number): boolean {
  return currentCount < MAX_PRODUCT_IMAGES;
}

export type { ProductMediaItem };
