/**
 * بانک‌های رایج ایران برای رسید کارت‌به‌کارت.
 * کاربر می‌تواند تایپ کند تا فهرست محدود شود؛ مقدار ذخیره‌شده باید یکی از همین نام‌ها باشد.
 */

export const IRAN_BANK_NAMES = [
  "ملی",
  "ملت",
  "صادرات",
  "تجارت",
  "سپه",
  "مسکن",
  "کشاورزی",
  "رفاه",
  "پاسارگاد",
  "پارسیان",
  "سامان",
  "اقتصاد نوین",
  "سینا",
  "شهر",
  "آینده",
  "دی",
  "سرمایه",
  "ایران زمین",
  "کارآفرین",
  "گردشگری",
  "خاورمیانه",
  "پست بانک",
  "توسعه تعاون",
  "صنعت و معدن",
  "رسالت",
  "مهر ایران",
] as const;

export type IranBankName = (typeof IRAN_BANK_NAMES)[number];

const bankSet = new Set<string>(IRAN_BANK_NAMES);

export function isIranBankName(name: string): name is IranBankName {
  return bankSet.has(name);
}
