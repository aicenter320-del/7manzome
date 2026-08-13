import "server-only";

import { z } from "zod";

/**
 * اعتبارسنجی متغیرهای محیطی.
 *
 * این فایل فقط در سرور قابل import است. اگر متغیر اجباری غایب باشد،
 * برنامه در همان لحظه بوت با پیام فارسی خطا می‌دهد تا خطاهای مبهم
 * زمان اجرا رخ ندهد. فهرست کامل متغیرها: docs/05-ops/environment.md
 */

const booleanish = z
  .enum(["true", "false", "1", "0"])
  .transform((value) => value === "true" || value === "1");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  /** آدرس پایه عمومی سایت؛ برای ساخت لینک هدیه و QR استفاده می‌شود. */
  APP_URL: z.string().url().default("http://localhost:3000"),

  /** آدرس دیتابیس SQLite با پیشوند اجباری file: (سازگار با libsql). */
  DATABASE_URL: z.string().min(1).default("file:./data/haft.db"),
  DATABASE_AUTH_TOKEN: z.string().optional(),

  /** کلید امضای سشن؛ در محیط production حداقل ۳۲ کاراکتر. */
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET باید حداقل ۳۲ کاراکتر باشد"),

  /** مسیر ذخیره فایل‌های آپلودی؛ حتماً بیرون از public نگه داشته می‌شود. */
  STORAGE_DIR: z.string().default("./storage"),

  /** انتخاب آداپتور پیامک. console فقط در محیط توسعه. */
  SMS_PROVIDER: z.enum(["console", "kavenegar"]).default("console"),
  KAVENEGAR_API_KEY: z.string().optional(),
  KAVENEGAR_SENDER: z.string().optional(),
  KAVENEGAR_OTP_TEMPLATE: z.string().optional(),

  /** منبع قیمت طلا. manual یعنی قیمت را ادمین دستی وارد می‌کند. */
  GOLD_PRICE_PROVIDER: z.enum(["manual", "external"]).default("manual"),
  GOLD_PRICE_API_URL: z.string().url().optional(),
  GOLD_PRICE_API_KEY: z.string().optional(),

  /** شماره موبایل اولین سوپر‌ادمین که هنگام seed ساخته می‌شود. */
  ADMIN_BOOTSTRAP_PHONE: z
    .string()
    .regex(/^09\d{9}$/, "شماره موبایل باید با 09 شروع شود و ۱۱ رقم باشد")
    .default("09120000000"),

  /** فقط در توسعه: کد یک‌بارمصرف در پاسخ API برگردانده شود. */
  DEV_EXPOSE_OTP: booleanish.default(false),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    APP_URL: process.env.APP_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
    SESSION_SECRET:
      process.env.SESSION_SECRET ??
      // مقدار پیش‌فرض فقط برای توسعه و تست تا اجرای اولیه پروژه ساده بماند.
      (process.env.NODE_ENV === "production"
        ? undefined
        : "haft-manzumeh-development-only-session-secret"),
    STORAGE_DIR: process.env.STORAGE_DIR,
    SMS_PROVIDER: process.env.SMS_PROVIDER,
    KAVENEGAR_API_KEY: process.env.KAVENEGAR_API_KEY,
    KAVENEGAR_SENDER: process.env.KAVENEGAR_SENDER,
    KAVENEGAR_OTP_TEMPLATE: process.env.KAVENEGAR_OTP_TEMPLATE,
    GOLD_PRICE_PROVIDER: process.env.GOLD_PRICE_PROVIDER,
    GOLD_PRICE_API_URL: process.env.GOLD_PRICE_API_URL,
    GOLD_PRICE_API_KEY: process.env.GOLD_PRICE_API_KEY,
    ADMIN_BOOTSTRAP_PHONE: process.env.ADMIN_BOOTSTRAP_PHONE,
    DEV_EXPOSE_OTP: process.env.DEV_EXPOSE_OTP,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`پیکربندی محیط نامعتبر است:\n${details}`);
  }

  if (parsed.data.SMS_PROVIDER === "kavenegar" && !parsed.data.KAVENEGAR_API_KEY) {
    throw new Error("وقتی SMS_PROVIDER=kavenegar است، KAVENEGAR_API_KEY الزامی است.");
  }

  if (parsed.data.GOLD_PRICE_PROVIDER === "external" && !parsed.data.GOLD_PRICE_API_URL) {
    throw new Error("وقتی GOLD_PRICE_PROVIDER=external است، GOLD_PRICE_API_URL الزامی است.");
  }

  return parsed.data;
}

export const env: Env = loadEnv();

export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
