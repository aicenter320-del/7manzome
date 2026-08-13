import "server-only";

import type {
  InitiatePaymentInput,
  InitiatePaymentResult,
  PaymentProvider,
} from "../../domain/types";

/**
 * درگاه پرداخت آنلاین — اسکلت آماده.
 *
 * ⚠️ درگاه هنوز گرفته نشده است. این پیاده‌سازی عمداً غیرفعال است تا مرز
 * معماری از روز اول وجود داشته باشد و افزودن درگاه در آینده نیازی به
 * تغییر در ماژول‌های orders یا gifting نداشته باشد (ADR-0008).
 *
 * برای فعال‌سازی در آینده:
 *   ۱. isEnabled را true کنید.
 *   ۲. initiate را با فراخوانی API درگاه و ساخت رکورد پرداخت پیاده کنید.
 *   ۳. یک Route Handler برای بازگشت از درگاه در app/api/payments/callback بسازید.
 *   ۴. تایید نهایی را از طریق تابع confirmPayment ماژول انجام دهید تا منطق
 *      ثبت طلا در دفتر کل یکسان بماند.
 */
export const onlineGatewayProvider: PaymentProvider = {
  key: "online_gateway",
  label: "درگاه پرداخت آنلاین",
  requiresManualReview: false,
  isEnabled: false,

  async initiate(_input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    throw new Error(
      "پرداخت آنلاین هنوز فعال نیست. لطفاً از روش کارت به کارت استفاده کنید.",
    );
  },
};
