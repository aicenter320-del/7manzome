/**
 * اقلام ناوبری پنل مدیریت.
 * hrefها نسبت به /admin هستند؛ صفحه لایوت آن‌ها را به مسیر کامل وصل می‌کند.
 */

export const ADMIN_NAV_GROUPS = [
  { id: "today", label: "امروز" },
  { id: "ops", label: "عملیات" },
  { id: "shop", label: "فروشگاه" },
  { id: "people", label: "افراد" },
  { id: "org", label: "سازمان" },
] as const;

export type AdminNavGroupId = (typeof ADMIN_NAV_GROUPS)[number]["id"];

export interface AdminNavItem {
  href: string;
  label: string;
  group: AdminNavGroupId;
  /** مجوز لازم؛ null یعنی همه کارکنان پنل را می‌بینند. */
  requiredPermission: string | null;
}

export const adminNav: readonly AdminNavItem[] = [
  { href: "/", label: "داشبورد", group: "today", requiredPermission: null },
  { href: "/payments", label: "پرداخت‌ها", group: "ops", requiredPermission: "payment:read" },
  { href: "/orders", label: "سفارش‌ها", group: "ops", requiredPermission: "order:read" },
  { href: "/treasures", label: "گنجینه‌ها", group: "ops", requiredPermission: "treasury:read" },
  { href: "/gift-cards", label: "کارت هدیه", group: "ops", requiredPermission: "treasury:read" },
  { href: "/products", label: "محصولات", group: "shop", requiredPermission: "catalog:read" },
  { href: "/gold-price", label: "قیمت طلا", group: "shop", requiredPermission: "gold_price:read" },
  {
    href: "/bank-accounts",
    label: "حساب‌های بانکی",
    group: "shop",
    requiredPermission: "payment:review",
  },
  { href: "/users", label: "کاربران", group: "people", requiredPermission: "user:read" },
  { href: "/children", label: "کودکان", group: "people", requiredPermission: "child:read" },
  { href: "/roles", label: "نقش‌ها", group: "org", requiredPermission: "role:write" },
  { href: "/files", label: "فایل‌ها", group: "org", requiredPermission: null },
  { href: "/content", label: "محتوا", group: "org", requiredPermission: "content:write" },
  { href: "/settings", label: "تنظیمات", group: "org", requiredPermission: "settings:write" },
  { href: "/reports", label: "گزارش‌ها", group: "org", requiredPermission: "report:read" },
];
