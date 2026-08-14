/**
 * اقلام ناوبری پنل مدیریت.
 * hrefها نسبت به /admin هستند؛ صفحه لایوت آن‌ها را به مسیر کامل وصل می‌کند.
 */

export interface AdminNavItem {
  href: string;
  label: string;
  /** مجوز لازم؛ null یعنی همه کارکنان پنل را می‌بینند. */
  requiredPermission: string | null;
}

export const adminNav: readonly AdminNavItem[] = [
  { href: "/", label: "داشبورد", requiredPermission: null },
  { href: "/orders", label: "سفارش‌ها", requiredPermission: "order:read" },
  { href: "/payments", label: "پرداخت‌ها", requiredPermission: "payment:read" },
  { href: "/users", label: "کاربران", requiredPermission: "user:read" },
  { href: "/roles", label: "نقش‌ها", requiredPermission: "role:write" },
  { href: "/children", label: "کودکان", requiredPermission: "child:read" },
  { href: "/treasures", label: "گنجینه‌ها", requiredPermission: "treasury:read" },
  { href: "/products", label: "محصولات", requiredPermission: "catalog:read" },
  { href: "/files", label: "فایل‌ها", requiredPermission: null },
  { href: "/gold-price", label: "قیمت طلا", requiredPermission: "gold_price:read" },
  { href: "/bank-accounts", label: "حساب‌های بانکی", requiredPermission: "payment:review" },
  { href: "/gift-cards", label: "کارت هدیه", requiredPermission: "treasury:read" },
  { href: "/content", label: "محتوا", requiredPermission: "content:write" },
  { href: "/settings", label: "تنظیمات", requiredPermission: "settings:write" },
  { href: "/reports", label: "گزارش‌ها", requiredPermission: "report:read" },
];
