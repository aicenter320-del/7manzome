import type { NextConfig } from "next";

const cpuCountRaw = process.env.NEXT_CPU_COUNT;
const cpuCount = cpuCountRaw ? Number.parseInt(cpuCountRaw, 10) : Number.NaN;
const constrainedBuild = Number.isInteger(cpuCount) && cpuCount > 0;

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
    ...(constrainedBuild
      ? {
          cpus: cpuCount,
          workerThreads: false,
        }
      : {}),
  },

  webpack: constrainedBuild
    ? (config) => {
        config.parallelism = 1;
        return config;
      }
    : undefined,

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
