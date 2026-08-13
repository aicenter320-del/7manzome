import "server-only";

import { env } from "@/shared/config/env";

/**
 * لاگ ساخت‌یافته سبک.
 *
 * پیام‌های لاگ عمداً انگلیسی‌اند تا جست‌وجوپذیر باشند (برخلاف پیام‌های کاربر که فارسی‌اند).
 *
 * ⚠️ هرگز در لاگ نمی‌نویسیم: کد یک‌بارمصرف، توکن سشن، کد ملی کامل، محتوای رسید.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const minimumWeight = LEVEL_WEIGHT[env.NODE_ENV === "production" ? "info" : "debug"];

/** کلیدهایی که مقدارشان هرگز نباید در لاگ ظاهر شود. */
const REDACTED_KEYS = new Set([
  "code",
  "codeHash",
  "otp",
  "token",
  "tokenHash",
  "password",
  "secret",
  "authorization",
  "nationalId",
  "cardNumber",
]);

function redact(context: Record<string, unknown>): Record<string, unknown> {
  const safe: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(context)) {
    safe[key] = REDACTED_KEYS.has(key) ? "[redacted]" : value;
  }

  return safe;
}

function write(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  if (LEVEL_WEIGHT[level] < minimumWeight) return;

  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...(context ? redact(context) : {}),
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => write("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) => write("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => write("warn", message, context),
  error: (message: string, context?: Record<string, unknown>) => write("error", message, context),
};

/** استخراج پیام قابل لاگ از یک خطای نامعلوم. */
export function describeError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
}
