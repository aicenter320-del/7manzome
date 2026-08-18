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

/** عرض ستون اپ؛ باید با `--customer-app-width` در globals.css یکی بماند. */
export const customerAppMaxWidth = "36rem";

/** `sizes` تصاویر داخل ستون اپ؛ نه تمام عرض ویوپورت. */
export const customerImageSizes = {
  column: `(max-width: ${customerAppMaxWidth}) 100vw, ${customerAppMaxWidth}`,
  halfColumn: `(max-width: ${customerAppMaxWidth}) 50vw, 18rem`,
  thirdColumn: `(max-width: ${customerAppMaxWidth}) 40vw, 15rem`,
} as const;

export type SiteNavItem = {
  title: string;
  href: string;
  description: string;
};

/** چهار تب نوار پایین اپ مشتری. حساب بسته به ورود به /dashboard یا /login می‌رود. */
export const customerTabs = [
  { id: "home", title: "خانه", href: "/" },
  { id: "shop", title: "قطعه‌ها", href: "/products" },
  { id: "gift", title: "هدیه", href: "/gift" },
  { id: "account", title: "حساب", href: "/dashboard" },
] as const;

/**
 * مسیرهای اصلی خرید؛ در شیت «بیشتر» هم هستند.
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

/** مسیرهای فرعی شیت «بیشتر»؛ خانه و حساب در نوار پایین‌اند. */
export const moreNav = [
  {
    title: "مناسبت‌ها",
    href: "/occasions",
    description: "تولد، اولین دندان، نوروز — قطعه را از روی مناسبت ببینید",
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

export function isActiveHref(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
