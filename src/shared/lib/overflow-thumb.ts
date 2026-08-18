/**
 * اندازه و جای شست نشانگر اسکرول افقی، نسبت به طول محتوا.
 * اعداد بین ۰ و ۱؛ بدون دانش دامنه.
 */
export function overflowThumb({
  clientWidth,
  scrollWidth,
  scrollLeft,
  rtl,
}: {
  clientWidth: number;
  scrollWidth: number;
  scrollLeft: number;
  rtl: boolean;
}): { overflow: boolean; start: number; size: number } {
  const max = scrollWidth - clientWidth;
  if (max <= 1 || scrollWidth <= 0 || clientWidth <= 0) {
    return { overflow: false, start: 0, size: 1 };
  }

  const size = Math.min(1, Math.max(clientWidth / scrollWidth, 0.12));
  let progress: number;
  if (!rtl) {
    progress = scrollLeft / max;
  } else if (scrollLeft < 0) {
    progress = Math.abs(scrollLeft) / max;
  } else {
    progress = (max - scrollLeft) / max;
  }
  progress = Math.min(1, Math.max(0, progress));
  return { overflow: true, start: progress * (1 - size), size };
}

/** نسبت اسکرول افقی به حداکثر، برای پرش با کلیک روی نوار. */
export function overflowScrollLeft({
  clientWidth,
  scrollWidth,
  ratio,
  rtl,
}: {
  clientWidth: number;
  scrollWidth: number;
  ratio: number;
  rtl: boolean;
}): number {
  const max = Math.max(0, scrollWidth - clientWidth);
  const clamped = Math.min(1, Math.max(0, ratio));
  return rtl ? -clamped * max : clamped * max;
}
