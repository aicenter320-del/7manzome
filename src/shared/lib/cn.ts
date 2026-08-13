import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** ادغام امن کلاس‌های Tailwind با حل تعارض‌ها. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
