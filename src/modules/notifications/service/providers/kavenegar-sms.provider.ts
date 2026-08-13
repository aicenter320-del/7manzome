import "server-only";

import { env } from "@/shared/config/env";
import { describeError, logger } from "@/server/logger";

import type { SmsProvider, SmsResult, SmsSendInput } from "../../domain/types";

/**
 * آداپتور کاوه‌نگار.
 *
 * دو مسیر دارد:
 *   - ارسال قالبی (verify/lookup) برای کد یک‌بارمصرف، چون اپراتورها ارسال
 *     تبلیغاتی را فیلتر می‌کنند و کد ورود باید از مسیر قالب برود.
 *   - ارسال ساده برای پیام‌های اطلاع‌رسانی.
 *
 * با تنظیم SMS_PROVIDER=kavenegar فعال می‌شود.
 */

interface KavenegarResponse {
  return?: { status?: number; message?: string };
  entries?: Array<{ messageid?: number | string }>;
}

const BASE_URL = "https://api.kavenegar.com/v1";
const REQUEST_TIMEOUT_MS = 10_000;

export const kavenegarSmsProvider: SmsProvider = {
  key: "kavenegar",

  async send(input: SmsSendInput): Promise<SmsResult> {
    const apiKey = env.KAVENEGAR_API_KEY;

    if (!apiKey) {
      return { ok: false, error: "کلید سرویس پیامک تنظیم نشده است." };
    }

    const useTemplate = Boolean(input.template && env.KAVENEGAR_OTP_TEMPLATE);

    const url = useTemplate
      ? `${BASE_URL}/${apiKey}/verify/lookup.json`
      : `${BASE_URL}/${apiKey}/sms/send.json`;

    const body = new URLSearchParams(
      useTemplate
        ? {
            receptor: input.to,
            template: env.KAVENEGAR_OTP_TEMPLATE ?? "",
            token: input.templateParams?.token ?? "",
          }
        : {
            receptor: input.to,
            message: input.body,
            ...(env.KAVENEGAR_SENDER ? { sender: env.KAVENEGAR_SENDER } : {}),
          },
    );

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      const payload = (await response.json()) as KavenegarResponse;
      const status = payload.return?.status;

      if (!response.ok || status !== 200) {
        const message = payload.return?.message ?? `HTTP ${response.status}`;
        logger.warn("sms send rejected by provider", { to: input.to, status, message });
        return { ok: false, error: message };
      }

      const messageId = payload.entries?.[0]?.messageid;

      return { ok: true, providerMessageId: messageId ? String(messageId) : undefined };
    } catch (error) {
      logger.error("sms send failed", { to: input.to, error: describeError(error) });
      return { ok: false, error: "ارسال پیامک با خطا مواجه شد." };
    }
  },
};
