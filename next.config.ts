import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // بسته‌های سمت سرور که نباید توسط باندلر پردازش شوند.
  serverExternalPackages: ["@libsql/client", "libsql"],

  experimental: {
    // اکشن‌های سرور باید بتوانند تصویر رسید پرداخت را دریافت کنند.
    serverActions: {
      bodySizeLimit: "8mb",
    },
    // برای unauthorized() و forbidden() در نگهبان پنل ادمین.
    authInterrupts: true,
  },

  // تصاویر آپلودی از مسیر کنترل‌شده سرو می‌شوند، نه مستقیم از فایل‌سیستم.
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
    qualities: [75, 100],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
