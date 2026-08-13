/**
 * ثابت‌های عمومی برند و سایت.
 * این فایل در کلاینت هم قابل import است، پس نباید هیچ مقدار محرمانه‌ای داشته باشد.
 */

export const site = {
  name: "هفت منظومه",
  nameEn: "Haft Manzumeh",
  tagline: "گنجینه طلای فرزندت را بساز.",
  description:
    "هفت منظومه طلافروشی آنلاین تخصصی کودکان است؛ از اولین هدیه تا هجده‌سالگی، هر هدیه می‌تواند بخشی از آینده او باشد.",
  slogan: "هر هدیه، یک قدم برای ساختن گنجینه او.",
  supportPhone: "۰۲۱-۰۰۰۰۰۰۰۰",
  locale: "fa-IR",
  direction: "rtl",
} as const;

/** ناوبری اصلی سایت عمومی (بند ۳۶ سند محصول). */
export const mainNav = [
  { title: "خانه", href: "/" },
  { title: "طلا برای کودک", href: "/products" },
  { title: "مناسبت‌ها", href: "/occasions" },
  { title: "هدیه بده", href: "/gift" },
  { title: "گنجینه‌ها", href: "/treasures" },
  { title: "درباره هفت منظومه", href: "/about" },
] as const;
