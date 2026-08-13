import "server-only";

import { describeError, logger } from "@/server/logger";
import { env } from "@/shared/config/env";
import { toEnglishDigits } from "@/shared/lib/persian";

import { SMS_TEMPLATES, type SmsTemplateKey } from "../domain/templates";
import type { SmsProvider, SmsResult } from "../domain/types";
import { insertQueuedMessage, updateMessageStatus } from "../repo/sms.repo";
import { consoleSmsProvider } from "./providers/console-sms.provider";
import { kavenegarSmsProvider } from "./providers/kavenegar-sms.provider";

/**
 * ارسال پیامک.
 *
 * دو قانون مهم:
 *   ۱. هر پیامک در sms_messages ثبت می‌شود، حتی در حالت console. بدون این
 *      تاریخچه، عیب‌یابی شکایت «پیامک نرسید» غیرممکن است.
 *   ۲. شکست ارسال پیامک نباید عملیات اصلی را برگرداند. اگر پرداخت تایید شد
 *      ولی پیامک نرفت، پرداخت همچنان تایید است.
 */

const providers: Record<string, SmsProvider> = {
  console: consoleSmsProvider,
  kavenegar: kavenegarSmsProvider,
};

function activeProvider(): SmsProvider {
  return providers[env.SMS_PROVIDER] ?? consoleSmsProvider;
}

function normalizePhone(phone: string): string {
  return toEnglishDigits(phone).replace(/\D/g, "");
}

/** ارسال پیامک با متن آزاد. */
export async function sendSms(input: {
  to: string;
  body: string;
  template?: string;
  templateParams?: Record<string, string>;
}): Promise<SmsResult> {
  const provider = activeProvider();
  const to = normalizePhone(input.to);

  const messageId = await insertQueuedMessage({
    phone: to,
    body: input.body,
    provider: provider.key,
    template: input.template ?? null,
  });

  try {
    const result = await provider.send({
      to,
      body: input.body,
      ...(input.template ? { template: input.template } : {}),
      ...(input.templateParams ? { templateParams: input.templateParams } : {}),
    });

    if (messageId) {
      await updateMessageStatus(messageId, {
        status: result.ok ? "sent" : "failed",
        providerMessageId: result.providerMessageId ?? null,
        errorMessage: result.error ?? null,
        sentAt: result.ok ? Date.now() : null,
      });
    }

    return result;
  } catch (error) {
    const message = describeError(error);
    logger.error("sms dispatch threw", { to, error: message });

    if (messageId) {
      await updateMessageStatus(messageId, { status: "failed", errorMessage: message });
    }

    return { ok: false, error: "ارسال پیامک با خطا مواجه شد." };
  }
}

/** ارسال پیامک از روی قالب؛ روش توصیه‌شده. */
export async function sendTemplatedSms<K extends SmsTemplateKey>(
  to: string,
  templateKey: K,
  data: Parameters<(typeof SMS_TEMPLATES)[K]["render"]>[0],
): Promise<SmsResult> {
  const template = SMS_TEMPLATES[templateKey];

  // انتخاب قالب در سطح تایپ تضمین شده؛ اینجا فقط امضای render را باز می‌کنیم.
  const body = (template.render as (payload: typeof data) => string)(data);

  return sendSms({ to, body, template: template.key });
}

/** ارسال کد یک‌بارمصرف؛ مسیر جدا دارد چون قالب سرویس پیامک متفاوت است. */
export async function sendOtpSms(to: string, code: string): Promise<SmsResult> {
  return sendSms({
    to,
    body: SMS_TEMPLATES.otp.render({ code }),
    template: SMS_TEMPLATES.otp.key,
    templateParams: { token: code },
  });
}
