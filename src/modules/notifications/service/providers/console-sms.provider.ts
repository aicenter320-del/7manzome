import "server-only";

import { logger } from "@/server/logger";

import type { SmsProvider, SmsResult, SmsSendInput } from "../../domain/types";

/**
 * آداپتور توسعه: پیامک ارسال نمی‌شود، فقط در ترمینال چاپ می‌شود.
 *
 * توجه: کد یک‌بارمصرف اینجا عمداً در ترمینال دیده می‌شود تا توسعه ممکن باشد.
 * به همین دلیل SMS_PROVIDER=console هرگز نباید در production استفاده شود.
 */
export const consoleSmsProvider: SmsProvider = {
  key: "console",

  async send(input: SmsSendInput): Promise<SmsResult> {
    // در محیط توسعه، خواندنی بودن مهم‌تر از ساخت‌یافته بودن است.
    console.warn(
      [
        "",
        "┌──────────────── پیامک شبیه‌سازی‌شده ────────────────",
        `│ گیرنده: ${input.to}`,
        ...input.body.split("\n").map((line) => `│ ${line}`),
        "└────────────────────────────────────────────────────",
        "",
      ].join("\n"),
    );

    logger.info("sms simulated", { to: input.to, template: input.template });

    return { ok: true, providerMessageId: `console-${Date.now()}` };
  },
};
