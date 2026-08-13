import localFont from "next/font/local";

/**
 * فونت ایران‌سنس‌ایکس به‌صورت لوکال (خانوادهٔ ایستا، همهٔ وزن‌ها).
 * بیلد به سرور بیرونی وابسته نیست.
 */
export const iranSansX = localFont({
  src: [
    { path: "../../assets/fonts/iransansx/IRANSansX-Thin.woff2", weight: "100", style: "normal" },
    { path: "../../assets/fonts/iransansx/IRANSansX-UltraLight.woff2", weight: "200", style: "normal" },
    { path: "../../assets/fonts/iransansx/IRANSansX-Light.woff2", weight: "300", style: "normal" },
    { path: "../../assets/fonts/iransansx/IRANSansX-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../assets/fonts/iransansx/IRANSansX-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../assets/fonts/iransansx/IRANSansX-DemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../assets/fonts/iransansx/IRANSansX-Bold.woff2", weight: "700", style: "normal" },
    { path: "../../assets/fonts/iransansx/IRANSansX-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "../../assets/fonts/iransansx/IRANSansX-Heavy.woff2", weight: "850", style: "normal" },
    { path: "../../assets/fonts/iransansx/IRANSansX-Black.woff2", weight: "900", style: "normal" },
    { path: "../../assets/fonts/iransansx/IRANSansX-ExtraBlack.woff2", weight: "950", style: "normal" },
  ],
  display: "swap",
  variable: "--font-iran-sans-x",
  fallback: ["Tahoma", "ui-sans-serif", "sans-serif"],
  preload: false,
});
