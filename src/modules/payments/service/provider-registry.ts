import "server-only";

import type { PaymentProviderKey } from "@/shared/types/enums";

import type { PaymentProvider } from "../domain/types";
import { cardTransferProvider } from "./providers/card-transfer.provider";
import { onlineGatewayProvider } from "./providers/online-gateway.provider";

/**
 * رجیستری روش‌های پرداخت.
 *
 * تنها جایی که پیاده‌سازی‌های پرداخت شناخته می‌شوند. افزودن روش جدید =
 * افزودن یک ردیف به این نگاشت.
 */

const registry: Record<PaymentProviderKey, PaymentProvider> = {
  card_transfer: cardTransferProvider,
  online_gateway: onlineGatewayProvider,
};

export function getPaymentProvider(key: PaymentProviderKey): PaymentProvider {
  const provider = registry[key];

  if (!provider.isEnabled) {
    throw new Error(`روش پرداخت «${provider.label}» در حال حاضر فعال نیست.`);
  }

  return provider;
}

/** روش‌های قابل استفاده برای نمایش در صفحه پرداخت. */
export function enabledProviders(): PaymentProvider[] {
  return Object.values(registry).filter((provider) => provider.isEnabled);
}

/** روش پیش‌فرض؛ فعلاً همیشه کارت‌به‌کارت. */
export function defaultProvider(): PaymentProvider {
  const [first] = enabledProviders();

  if (!first) throw new Error("هیچ روش پرداخت فعالی وجود ندارد.");

  return first;
}
