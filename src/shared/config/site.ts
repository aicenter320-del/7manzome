/**
 * ثابت‌های عمومی برند و سایت.
 * این فایل در کلاینت هم قابل import است، پس نباید هیچ مقدار محرمانه‌ای داشته باشد.
 */

export const site = {
  name: "هفت منظومه",
  nameEn: "Haft Manzumeh",
  tagline: "طلای کودک، هدیه‌ای که می‌ماند.",
  description:
    "دستبند، پلاک، سکه و شمش مخصوص کودک. قیمت هر قطعه مشخص است. خانواده هم می‌تواند بدون ساخت حساب برایش طلا بفرستد.",
  slogan: "هر هدیه، یک قدم برای ساختن گنجینه او.",
  supportPhone: "۰۲۱-۰۰۰۰۰۰۰۰",
  locale: "fa-IR",
  direction: "rtl",
} as const;

export type SiteNavItem = {
  title: string;
  href: string;
  description: string;
};

/**
 * سه کار اصلی بازدیدکننده در هدر.
 * خانه همان لوگو است؛ گنجینه و درباره در فوتر و منوی موبایل می‌آیند
 * تا مسیر خرید با مسیر هدیه قاطی نشود.
 */
export const mainNav = [
  {
    title: "طلای کودک",
    href: "/products",
    description: "زیور، سکه و شمش؛ قیمت هر قطعه مشخص است",
  },
  {
    title: "مناسبت‌ها",
    href: "/occasions",
    description: "تولد، اولین دندان، نوروز — قطعه را از روی مناسبت ببینید",
  },
  {
    title: "هدیه طلا",
    href: "/gift",
    description: "با لینک خانواده یا کارت؛ ساخت حساب لازم نیست",
  },
] as const satisfies readonly SiteNavItem[];

/** لینک‌های کمکی: فوتر و منوی موبایل، نه نوار اصلی دسکتاپ. */
export const moreNav = [
  {
    title: "خانه",
    href: "/",
    description: "بازگشت به صفحهٔ اول",
  },
  {
    title: "گنجینه‌ها",
    href: "/treasures",
    description: "نگاهی به وزن طلایی که خانواده‌ها جمع کرده‌اند",
  },
  {
    title: "چرا هفت منظومه",
    href: "/about",
    description: "شفافیت قیمت و داستان برند",
  },
] as const satisfies readonly SiteNavItem[];

export const footerNav = [
  { heading: "خرید و هدیه", items: mainNav },
  { heading: "هفت منظومه", items: moreNav },
] as const;

export function isActiveHref(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
