import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

/**
 * پیکربندی ESLint هفت منظومه.
 *
 * مهم‌ترین بخش این فایل قفل مرزهای معماری است. مستندات به‌تنهایی رعایت نمی‌شوند؛
 * وقتی نقض مرز خطای لینت بدهد و بیلد را بشکند، رعایت اجتناب‌ناپذیر می‌شود.
 * توضیح کامل معماری: docs/01-architecture/overview.md
 */

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "drizzle/**",
    "data/**",
    "storage/**",
    "backups/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),

  // ---------------------------------------------------------------
  // مرزهای معماری
  // ---------------------------------------------------------------
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/middleware.ts"],
    plugins: { boundaries },
    settings: {
      "boundaries/dependency-nodes": ["import", "dynamic-import", "export"],
      "boundaries/legacy-templates": false,

      // لایه اول طبقه‌بندی: هر فایل به کدام واحد معماری تعلق دارد.
      "boundaries/elements": [
        { type: "shared", pattern: "src/shared/**", partialMatch: false },
        { type: "server", pattern: "src/server/**", partialMatch: false },
        { type: "module", pattern: "src/modules/*", capture: ["moduleName"] },
        { type: "app", pattern: "src/app/**", partialMatch: false },
      ],

      // لایه دوم طبقه‌بندی: نوع فایل، مستقل از واحد معماری.
      "boundaries/files": [
        { pattern: "src/modules/*/index.ts", category: "module-public" },
        { pattern: "src/modules/*/domain/**", category: "module-domain" },
        { pattern: "src/modules/*/ui/**", category: "module-ui" },
        { pattern: "src/modules/*/actions/**", category: "module-actions" },
      ],
    },
    rules: {
      "boundaries/no-unknown": "off",
      "boundaries/no-unknown-files": "off",
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          message:
            "نقض مرز معماری: «{{ from.element.type }}» اجازه import از این مسیر را ندارد. قوانین در docs/01-architecture/overview.md",
          policies: [
            // shared پایین‌ترین لایه است و فقط به خودش وابسته می‌شود.
            {
              from: { element: { type: "shared" } },
              allow: [{ to: { element: { type: "shared" } } }],
            },

            // server فقط از shared و خودش استفاده می‌کند؛ هرگز از modules.
            {
              from: { element: { type: "server" } },
              allow: [
                { to: { element: { type: "shared" } } },
                { to: { element: { type: "server" } } },
              ],
            },

            // ماژول‌ها: درون خودشان آزادند. از ماژول دیگر index.ts، و برای
            // کامپوننت کلاینت مسیرهای ui/actions/domain تا barrelِ server-only
            // وارد باندل مرورگر نشود.
            {
              from: { element: { type: "module" } },
              allow: [
                { to: { element: { type: "shared" } } },
                { to: { element: { type: "server" } } },
                {
                  to: {
                    element: {
                      type: "module",
                      captured: { moduleName: "{{ from.element.captured.moduleName }}" },
                    },
                  },
                },
                {
                  to: {
                    element: { type: "module" },
                    file: { categories: ["module-public", "module-ui", "module-actions", "module-domain"] },
                  },
                },
              ],
            },

            // لایه مسیرها: از ماژول فقط API عمومی و مسیرهای امن کلاینت.
            {
              from: { element: { type: "app" } },
              allow: [
                { to: { element: { type: "shared" } } },
                { to: { element: { type: "server" } } },
                { to: { element: { type: "app" } } },
                {
                  to: {
                    element: { type: "module" },
                    file: { categories: ["module-public", "module-ui", "module-actions", "module-domain"] },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  },

  // ---------------------------------------------------------------
  // خالص ماندن لایه domain
  // ---------------------------------------------------------------
  {
    files: ["src/modules/*/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react",
              message:
                "لایه domain باید خالص بماند. کامپوننت را در ui/ بنویسید. دلیل: docs/01-architecture/overview.md",
            },
            {
              name: "next/navigation",
              message: "لایه domain نباید به Next وابسته شود.",
            },
            {
              name: "next/headers",
              message: "لایه domain نباید به Next وابسته شود.",
            },
            {
              name: "server-only",
              message: "لایه domain باید در تست هم قابل اجرا باشد؛ به سرور گره نزنید.",
            },
          ],
          patterns: [
            {
              group: ["drizzle-orm", "drizzle-orm/*", "@libsql/*"],
              message:
                "لایه domain نباید به دیتابیس دسترسی داشته باشد. کوئری را در repo/ بنویسید.",
            },
            {
              group: ["@/server", "@/server/*", "@/server/**"],
              message:
                "لایه domain باید خالص و بدون وابستگی به زیرساخت سرور بماند. منطق را با ورودی و خروجی ساده بنویسید.",
            },
            {
              regex: "^@/modules/[^/]+$",
              message:
                "لایه domain فقط از domain ماژول دیگر import کند (مثلاً @/modules/children/domain/...) نه از index.ts که سرویس سرور را وارد باندل کلاینت می‌کند.",
            },
          ],
        },
      ],
    },
  },

  // ---------------------------------------------------------------
  // دسترسی به اسکیمای دیتابیس فقط از repo/
  // ---------------------------------------------------------------
  {
    files: [
      "src/modules/*/service/**/*.ts",
      "src/modules/*/actions/**/*.ts",
      "src/app/**/*.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/server/db/schema", "@/server/db/schema/*"],
              message:
                "دسترسی مستقیم به اسکیما فقط از repo/ مجاز است. کوئری را به یک تابع در repo/ منتقل کنید.",
            },
          ],
        },
      ],
    },
  },

  {
    files: ["src/modules/*/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/server/db/schema", "@/server/db/schema/*"],
              message:
                "دسترسی مستقیم به اسکیما فقط از repo/ مجاز است. کوئری را به یک تابع در repo/ منتقل کنید.",
            },
            {
              regex: "^@/modules/[^/]+$",
              message:
                "کامپوننت UI نباید از index.ts ماژول دیگر import کند؛ از ui/ یا domain/ استفاده کنید تا server-only وارد باندل مرورگر نشود.",
            },
          ],
        },
      ],
    },
  },

  // ---------------------------------------------------------------
  // قوانین عمومی کیفیت
  // ---------------------------------------------------------------
  {
    files: ["src/**/*.{ts,tsx}", "scripts/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
    },
  },

  {
    // اسکریپت‌های عملیاتی و لاگر عمداً روی کنسول می‌نویسند.
    files: ["scripts/**/*.{ts,mjs}", "src/server/logger.ts"],
    rules: { "no-console": "off" },
  },

  {
    files: ["**/*.test.ts", "**/*.test.tsx", "e2e/**/*.ts"],
    rules: { "no-console": "off" },
  },
]);

export default eslintConfig;
