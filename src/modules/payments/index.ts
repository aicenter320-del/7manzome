/**
 * ماژول پرداخت — API عمومی.
 *
 * مسئول: پورت پرداخت، کارت‌به‌کارت، رسید و صف تایید.
 * این ماژول عمداً سفارش، مشارکت و گنجینه را نمی‌شناسد؛ تسویه با admin است.
 *
 * مستندات: docs/03-modules/payments.md
 */

export type {
  BankAccount,
  CardTransferReceipt,
  InitiatePaymentInput,
  InitiatePaymentResult,
  Payment,
  PaymentProvider,
  PaymentWithReceipts,
} from "./domain/types";

export {
  canReview,
  canSubmitReceipt,
  hoursRemaining,
  isExpired,
  REVIEW_QUEUE_STATUSES,
} from "./domain/payment-status";

export { PAYMENT_STATUS_LABELS } from "@/shared/types/enums";

export {
  applyReviewDecision,
  countAllPayments,
  countInReviewQueue,
  createBankAccount,
  createPayment,
  createPaymentWith,
  DuplicateReferenceError,
  expireStalePayments,
  getConfirmedAmountBetween,
  getConfirmedAmountSince,
  getPaymentById,
  getPaymentForContribution,
  getPaymentsForOrder,
  listAllBankAccounts,
  listBankAccounts,
  listConfirmedSalesBetween,
  listPayments,
  listPendingReviews,
  markUnderReview,
  PaymentError,
  submitCardReceipt,
  toggleBankAccount,
  countRejectedSince,
} from "./service/payment.service";

export { getPaymentProvider, enabledProviders } from "./service/provider-registry";

export {
  createBankAccountSchema,
  reviewPaymentSchema,
  submitReceiptSchema,
  toggleBankAccountSchema,
} from "./schema/payment.schema";

export {
  createBankAccountAction,
  reviewPaymentAction,
  submitReceiptAction,
  toggleBankAccountAction,
  uploadPaymentReceipt,
} from "./actions/payment.actions";

export { ReceiptForm } from "./ui/receipt-form";
export { ReceiptFilePreview } from "./ui/receipt-file-preview";
export { PaymentStatusCard } from "./ui/payment-status";
export { BankAccountCard } from "./ui/bank-account-card";
