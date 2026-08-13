import type { SmsProviderKey } from "@/shared/types/enums";

export interface SmsSendInput {
  to: string;
  body: string;
  /** نام قالب تاییدشده در سرویس پیامک؛ برخی سرویس‌ها فقط با قالب کار می‌کنند. */
  template?: string;
  /** پارامترهای قالب برای سرویس‌هایی که ارسال قالبی دارند. */
  templateParams?: Record<string, string>;
}

export interface SmsResult {
  ok: boolean;
  providerMessageId?: string;
  error?: string;
}

/**
 * پورت سرویس پیامک.
 *
 * افزودن سرویس جدید یعنی نوشتن یک پیاده‌سازی از این اینترفیس و ثبت آن در رجیستری.
 * هیچ‌جای دیگر پروژه نباید بداند از کدام سرویس استفاده می‌کنیم.
 */
export interface SmsProvider {
  readonly key: SmsProviderKey;
  send(input: SmsSendInput): Promise<SmsResult>;
}
