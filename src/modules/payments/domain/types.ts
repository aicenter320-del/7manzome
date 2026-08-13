import type {
  PaymentProviderKey,
  PaymentPurpose,
  PaymentStatus,
} from "@/shared/types/enums";

export interface Payment {
  id: string;
  paymentNumber: string;
  provider: PaymentProviderKey;
  purpose: PaymentPurpose;
  orderId: string | null;
  contributionId: string | null;
  payerUserId: string | null;
  amountRial: number;
  bankAccountId: string | null;
  status: PaymentStatus;
  expiresAt: number | null;
  confirmedAt: number | null;
  rejectedAt: number | null;
  rejectionReason: string | null;
  reviewedByUserId: string | null;
  createdAt: number;
}

export interface BankAccount {
  id: string;
  title: string;
  bankName: string;
  cardNumber: string;
  iban: string | null;
  accountHolder: string;
  isActive: boolean;
}

export interface CardTransferReceipt {
  id: string;
  paymentId: string;
  referenceNumber: string;
  paidAmountRial: number;
  payerName: string;
  payerCardLast4: string | null;
  bankName: string | null;
  paidAt: number;
  receiptFileId: string | null;
  note: string | null;
  createdAt: number;
}

/** پرداخت به‌همراه رسیدها؛ نمای صف تایید ادمین. */
export interface PaymentWithReceipts extends Payment {
  receipts: CardTransferReceipt[];
  bankAccount: BankAccount | null;
}

export interface InitiatePaymentInput {
  purpose: PaymentPurpose;
  orderId?: string;
  contributionId?: string;
  amountRial: number;
  payerUserId?: string | null;
}

export interface InitiatePaymentResult {
  paymentId: string;
  paymentNumber: string;
  /** آدرسی که کاربر برای تکمیل پرداخت باید به آن برود. */
  nextUrl: string;
  expiresAt: number | null;
}

/**
 * پورت درگاه پرداخت.
 *
 * افزودن درگاه آنلاین در آینده نباید نیازی به تغییر در ماژول‌های orders یا
 * gifting داشته باشد؛ فقط یک پیاده‌سازی جدید از این اینترفیس لازم است (ADR-0008).
 */
export interface PaymentProvider {
  readonly key: PaymentProviderKey;
  readonly label: string;
  /** آیا این روش نیازمند تایید انسانی است؟ */
  readonly requiresManualReview: boolean;
  readonly isEnabled: boolean;
  initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
}
