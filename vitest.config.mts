import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // پشتیبانی بومی Vite از paths تنظیم‌شده در tsconfig (@/*).
    tsconfigPaths: true,
  },
  test: {
    env: {
      GOLD_PRICE_PROVIDER: "manual",
    },
    globals: true,
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e"],
    // پیش‌فرض node است چون بیشتر تست‌ها منطق خالص دامنه‌اند.
    // تست کامپوننت باید در ابتدای فایل داکبلاک بگذارد:
    //   /** @vitest-environment jsdom */
    coverage: {
      reporter: ["text", "html"],
      include: ["src/modules/*/domain/**", "src/shared/lib/**"],
    },
  },
});
