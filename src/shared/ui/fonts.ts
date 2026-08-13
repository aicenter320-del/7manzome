import localFont from "next/font/local";

/**
 * فونت وزیرمتن به‌صورت متغیر (Variable) و کاملاً لوکال.
 *
 * عمداً از next/font/google استفاده نشده تا بیلد پروژه به دسترسی
 * به سرورهای گوگل وابسته نباشد. فایل فونت از پکیج npm «vazirmatn»
 * در src/assets/fonts کپی شده است.
 */
export const vazirmatn = localFont({
  src: "../../assets/fonts/Vazirmatn-Variable.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-vazirmatn",
  fallback: ["ui-sans-serif", "system-ui", "Segoe UI", "Tahoma", "sans-serif"],
  preload: true,
});
