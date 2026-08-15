import localFont from "next/font/local";

/**
 * پینار V4 متغیر با ارقام فارسی (محور وزن ۳۰۰ تا ۹۰۰).
 * بیلد به سرور بیرونی وابسته نیست.
 */
export const pinar = localFont({
  src: [
    {
      path: "../../assets/fonts/pinar/Pinar-FD-VF.woff2",
      weight: "300 900",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-pinar",
  fallback: ["Tahoma", "ui-sans-serif", "sans-serif"],
  preload: true,
});

/**
 * همان پینار با ارقام لاتین؛ فقط برای شناسه و کلاس `.ltr-nums`.
 */
export const pinarLatin = localFont({
  src: [
    {
      path: "../../assets/fonts/pinar/Pinar-VF.woff2",
      weight: "300 900",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-pinar-latin",
  fallback: ["Tahoma", "ui-sans-serif", "sans-serif"],
  preload: false,
});
