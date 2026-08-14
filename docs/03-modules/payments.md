# ماژول: پرداخت‌ها (`payments`)

**وضعیت:** ✅ کامل

## مسئولیت

پورت پرداخت، پیاده‌سازی کارت‌به‌کارت، مدیریت رسید و صف تایید ادمین.

این ماژول عمداً نمی‌داند تایید پرداخت چه اثری روی سفارش، مشارکت یا گنجینه دارد.
تسویه با `reviewAndSettlePayment` در ماژول `admin` است تا گراف وابستگی دور نگیرد.

## API عمومی

```ts
export type { Payment, PaymentWithReceipts, BankAccount, CardTransferReceipt, PaymentProvider } from "./domain/types";
export { canSubmitReceipt, canReview, hoursRemaining } from "./domain/payment-status";
export { PAYMENT_STATUS_LABELS } from "@/shared/types/enums";

export {
  createPayment,
  getPaymentById,
  getPaymentsForOrder,
  getPaymentForContribution,
  listBankAccounts,
  listAllBankAccounts,
  listPendingReviews,
  listPayments,
  countAllPayments,
  submitCardReceipt,
  markUnderReview,
  applyReviewDecision,
  expireStalePayments,
  getConfirmedAmountSince,
  countInReviewQueue,
  PaymentError,
  DuplicateReferenceError,
} from "./service/payment.service";

export { getPaymentProvider, enabledProviders } from "./service/provider-registry";

export {
  submitReceiptSchema,
  reviewPaymentSchema,
  createBankAccountSchema,
  toggleBankAccountSchema,
} from "./schema/payment.schema";

export {
  uploadPaymentReceipt,
  submitReceiptAction,
  reviewPaymentAction,
  createBankAccountAction,
  toggleBankAccountAction,
} from "./actions/payment.actions";

export { ReceiptForm } from "./ui/receipt-form";
export { ReceiptFilePreview } from "./ui/receipt-file-preview";
export { PaymentStatusCard } from "./ui/payment-status";
export { BankAccountCard } from "./ui/bank-account-card";
```

## جدول‌های دیتابیس

`payments`، `card_transfer_receipts`، `bank_accounts`

## وابستگی‌ها

`notifications` — اطلاع‌رسانی تایید یا رد پرداخت.

**ممنوع:** import از `orders`، `gifting`، `treasury`، `admin`، `identity`.

## معماری آداپتور

```ts
interface PaymentProvider {
  readonly key: "card_transfer" | "online_gateway";
  initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
  // آیا این روش نیازمند تایید انسانی است؟
  readonly requiresManualReview: boolean;
}
```

| پیاده‌سازی | وضعیت |
| --- | --- |
| `CardTransferProvider` | ✅ کامل پیاده می‌شود |
| `OnlineGatewayProvider` | اسکلت؛ فقط با گرفتن درگاه فعال می‌شود |

افزودن درگاه آنلاین در آینده **نباید** نیازی به تغییر در `orders` یا `gifting` داشته باشد.

## قوانین دامنه

- `reference_number` (شماره پیگیری) در کل سیستم **یکتاست** تا یک رسید دو بار پذیرفته نشود.
- مبلغ اعلامی کاربر با مبلغ پرداخت مقایسه می‌شود؛ اختلاف در صف تایید هشدار می‌دهد
  اما تصمیم نهایی با ادمین است.
- تصویر رسید همیشه `private` است، بیرون از `public` ذخیره می‌شود و فقط ادمین و
  خود پرداخت‌کننده می‌توانند ببینند.
- فقط نوع فایل تصویری و PDF پذیرفته می‌شود، با محدودیت حجم.
- تایید و رد پرداخت **همیشه** در `audit_logs` ثبت می‌شود، با شناسه ادمین.
- تنها گذار `confirmed` است که باعث ثبت طلا در دفتر کل می‌شود.
- ادمین نمی‌تواند پرداختی را که خودش ثبت کرده تایید کند (تفکیک وظایف در فاز بعد).
- مهلت پیش‌فرض پرداخت ۷۲ ساعت؛ پس از آن `expired`.
- آپلود رسید از اکشن multipart جدا (`uploadPaymentReceipt`) می‌آید؛ ثبت رسید JSON است.

## مسیرها

- `app/(site)/checkout/payment/[paymentId]`
- `app/(gift)/g/[token]/pay`
- `app/admin/payments` — صف تایید؛ جزئیات پرداخت تصویر رسید ارسالی را نشان می‌دهد
- `app/api/files/[...path]` — سرو کنترل‌شده تصویر رسید

## نقاط باز

- درگاه پرداخت آنلاین: هنوز گرفته نشده.
- تطبیق خودکار با صورت‌حساب بانکی: فاز بعد.
- صفحات مسیر پرداخت هنوز توسط ماژول مسیرها ساخته می‌شوند.
