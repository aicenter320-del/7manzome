import "server-only";

import { notifyRoles } from "@/modules/notifications";
import { recordAudit } from "@/server/audit";
import { roleSlugsWithPermission } from "@/server/auth/rbac";
import type {
  BankAccountRow,
  CardTransferReceiptRow,
  PaymentRow,
} from "@/server/db/types";
import { logger } from "@/server/logger";
import { formatRial } from "@/shared/lib/money";
import { sanitizeText, toEnglishDigits } from "@/shared/lib/persian";
import type { PaymentPurpose, PaymentStatus } from "@/shared/types/enums";

import {
  canSubmitReceipt,
  isExpired,
  validateReceiptAmount,
} from "../domain/payment-status";
import type {
  BankAccount,
  CardTransferReceipt,
  Payment,
  PaymentWithReceipts,
} from "../domain/types";
import {
  countAllPayments as countPaymentRows,
  findActiveBankAccounts,
  findAllBankAccounts,
  findBankAccountById,
  findPaymentById,
  findPaymentForContribution,
  findPaymentsByStatus,
  findPaymentsForOrder,
  findReceiptsForPayment,
  findStalePayments,
  countRejectedPaymentsBetween,
  findConfirmedSalesBetween,
  insertBankAccount,
  insertReceipt,
  listPayments as listPaymentRows,
  referenceNumberExists,
  setBankAccountActive,
  sumConfirmedAmount,
  sumConfirmedAmountBetween,
  updatePaymentStatus,
} from "../repo/payment.repo";
import { defaultProvider, getPaymentProvider } from "./provider-registry";

/**
 * چرخه حیات پرداخت.
 *
 * ⚠️ این ماژول عمداً نمی‌داند تایید پرداخت چه اثری روی سفارش، مشارکت یا
 * گنجینه دارد. آن مسئولیت ماژول settlement است تا گراف وابستگی دور نگیرد.
 */

export class PaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentError";
  }
}

export class DuplicateReferenceError extends PaymentError {
  constructor() {
    super("این شماره پیگیری قبلاً در سیستم ثبت شده است. شماره پیگیری صحیح را وارد کنید.");
    this.name = "DuplicateReferenceError";
  }
}

function toPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    paymentNumber: row.paymentNumber,
    provider: row.provider,
    purpose: row.purpose,
    orderId: row.orderId,
    contributionId: row.contributionId,
    payerUserId: row.payerUserId,
    amountRial: row.amountRial,
    bankAccountId: row.bankAccountId,
    status: row.status,
    expiresAt: row.expiresAt,
    confirmedAt: row.confirmedAt,
    rejectedAt: row.rejectedAt,
    rejectionReason: row.rejectionReason,
    reviewedByUserId: row.reviewedByUserId,
    createdAt: row.createdAt,
  };
}

function toBankAccount(row: BankAccountRow): BankAccount {
  return {
    id: row.id,
    title: row.title,
    bankName: row.bankName,
    cardNumber: row.cardNumber,
    iban: row.iban,
    accountHolder: row.accountHolder,
    isActive: row.isActive,
  };
}

function toReceipt(row: CardTransferReceiptRow): CardTransferReceipt {
  return {
    id: row.id,
    paymentId: row.paymentId,
    referenceNumber: row.referenceNumber,
    paidAmountRial: row.paidAmountRial,
    payerName: row.payerName,
    payerCardLast4: row.payerCardLast4,
    bankName: row.bankName,
    paidAt: row.paidAt,
    receiptFileId: row.receiptFileId,
    note: row.note,
    createdAt: row.createdAt,
  };
}

/** ساخت پرداخت جدید با روش پیش‌فرض. */
export async function createPayment(input: {
  purpose: PaymentPurpose;
  orderId?: string;
  contributionId?: string;
  amountRial: number;
  payerUserId?: string | null;
}): Promise<{ paymentId: string; paymentNumber: string; nextUrl: string }> {
  if (input.amountRial <= 0) {
    throw new PaymentError("مبلغ پرداخت باید بزرگ‌تر از صفر باشد.");
  }

  const provider = defaultProvider();

  const result = await provider.initiate({
    purpose: input.purpose,
    ...(input.orderId ? { orderId: input.orderId } : {}),
    ...(input.contributionId ? { contributionId: input.contributionId } : {}),
    amountRial: input.amountRial,
    payerUserId: input.payerUserId ?? null,
  });

  logger.info("payment created", {
    paymentId: result.paymentId,
    purpose: input.purpose,
    provider: provider.key,
  });

  return {
    paymentId: result.paymentId,
    paymentNumber: result.paymentNumber,
    nextUrl: result.nextUrl,
  };
}

/** ساخت پرداخت با روش مشخص؛ برای زمانی که چند روش فعال باشد. */
export async function createPaymentWith(
  providerKey: Parameters<typeof getPaymentProvider>[0],
  input: {
    purpose: PaymentPurpose;
    orderId?: string;
    contributionId?: string;
    amountRial: number;
    payerUserId?: string | null;
  },
): Promise<{ paymentId: string; nextUrl: string }> {
  const provider = getPaymentProvider(providerKey);

  const result = await provider.initiate({
    purpose: input.purpose,
    ...(input.orderId ? { orderId: input.orderId } : {}),
    ...(input.contributionId ? { contributionId: input.contributionId } : {}),
    amountRial: input.amountRial,
    payerUserId: input.payerUserId ?? null,
  });

  return { paymentId: result.paymentId, nextUrl: result.nextUrl };
}

export async function getPaymentById(paymentId: string): Promise<PaymentWithReceipts | null> {
  const row = await findPaymentById(paymentId);
  if (!row) return null;

  const [receipts, bankAccount] = await Promise.all([
    findReceiptsForPayment(paymentId),
    row.bankAccountId ? findBankAccountById(row.bankAccountId) : null,
  ]);

  return {
    ...toPayment(row),
    receipts: receipts.map(toReceipt),
    bankAccount: bankAccount ? toBankAccount(bankAccount) : null,
  };
}

export async function getPaymentsForOrder(orderId: string): Promise<Payment[]> {
  const rows = await findPaymentsForOrder(orderId);
  return rows.map(toPayment);
}

export async function getPaymentForContribution(
  contributionId: string,
): Promise<Payment | null> {
  const row = await findPaymentForContribution(contributionId);
  return row ? toPayment(row) : null;
}

export async function listBankAccounts(): Promise<BankAccount[]> {
  const rows = await findActiveBankAccounts();
  return rows.map(toBankAccount);
}

/** فهرست همه حساب‌ها برای پنل ادمین؛ شامل غیرفعال‌ها. */
export async function listAllBankAccounts(): Promise<BankAccount[]> {
  const rows = await findAllBankAccounts();
  return rows.map(toBankAccount);
}

export async function createBankAccount(input: {
  title: string;
  bankName: string;
  cardNumber: string;
  iban?: string;
  accountHolder: string;
  sortOrder?: number;
  actorUserId: string;
}): Promise<BankAccount> {
  const row = await insertBankAccount({
    title: sanitizeText(input.title, 80),
    bankName: sanitizeText(input.bankName, 60),
    cardNumber: input.cardNumber,
    iban: input.iban ?? null,
    accountHolder: sanitizeText(input.accountHolder, 100),
    sortOrder: input.sortOrder ?? 0,
  });

  await recordAudit({
    actorUserId: input.actorUserId,
    action: "bank_account.created",
    entityType: "bank_account",
    entityId: row.id,
    summary: `ثبت حساب بانکی «${row.title}»`,
  });

  return toBankAccount(row);
}

export async function toggleBankAccount(input: {
  bankAccountId: string;
  isActive: boolean;
  actorUserId: string;
}): Promise<void> {
  const existing = await findBankAccountById(input.bankAccountId);
  if (!existing) throw new PaymentError("حساب بانکی پیدا نشد.");

  await setBankAccountActive(input.bankAccountId, input.isActive);

  await recordAudit({
    actorUserId: input.actorUserId,
    action: input.isActive ? "bank_account.activated" : "bank_account.deactivated",
    entityType: "bank_account",
    entityId: input.bankAccountId,
    summary: input.isActive
      ? `فعال‌سازی حساب بانکی «${existing.title}»`
      : `غیرفعال‌سازی حساب بانکی «${existing.title}»`,
  });
}

/** صف تایید ادمین. */
export async function listPendingReviews(): Promise<PaymentWithReceipts[]> {
  const rows = await findPaymentsByStatus(["receipt_submitted", "under_review"]);

  return Promise.all(
    rows.map(async (row) => {
      const [receipts, bankAccount] = await Promise.all([
        findReceiptsForPayment(row.id),
        row.bankAccountId ? findBankAccountById(row.bankAccountId) : null,
      ]);

      return {
        ...toPayment(row),
        receipts: receipts.map(toReceipt),
        bankAccount: bankAccount ? toBankAccount(bankAccount) : null,
      };
    }),
  );
}

export interface SubmitReceiptInput {
  paymentId: string;
  referenceNumber: string;
  paidAmountRial: number;
  payerName: string;
  payerCardLast4?: string;
  bankName?: string;
  paidAt: number;
  receiptFileId?: string;
  note?: string;
  actorUserId?: string | null;
}

/**
 * ثبت رسید کارت‌به‌کارت توسط کاربر.
 *
 * یکتایی شماره پیگیری مهم‌ترین محافظت این روش است؛ بدون آن یک نفر می‌تواند
 * یک رسید را برای چند پرداخت استفاده کند.
 */
export async function submitCardReceipt(
  input: SubmitReceiptInput,
): Promise<{ receiptId: string; amountWarning: string | null }> {
  const payment = await findPaymentById(input.paymentId);

  if (!payment) throw new PaymentError("پرداخت پیدا نشد.");

  if (isExpired(payment.expiresAt)) {
    await updatePaymentStatus(payment.id, { status: "expired" });
    throw new PaymentError("مهلت این پرداخت به پایان رسیده است. لطفاً دوباره اقدام کنید.");
  }

  if (!canSubmitReceipt(payment.status)) {
    throw new PaymentError("برای این پرداخت امکان ثبت رسید وجود ندارد.");
  }

  const referenceNumber = toEnglishDigits(input.referenceNumber).replace(/\s/g, "");

  if (await referenceNumberExists(referenceNumber)) {
    throw new DuplicateReferenceError();
  }

  const receipt = await insertReceipt({
    paymentId: payment.id,
    referenceNumber,
    paidAmountRial: input.paidAmountRial,
    payerName: sanitizeText(input.payerName, 100),
    payerCardLast4: input.payerCardLast4
      ? toEnglishDigits(input.payerCardLast4).slice(-4)
      : null,
    bankName: input.bankName ? sanitizeText(input.bankName, 60) : null,
    paidAt: input.paidAt,
    receiptFileId: input.receiptFileId ?? null,
    note: input.note ? sanitizeText(input.note, 300) : null,
  });

  await updatePaymentStatus(payment.id, { status: "receipt_submitted" });

  const amountMatch = validateReceiptAmount(payment.amountRial, input.paidAmountRial);

  await recordAudit({
    actorUserId: input.actorUserId ?? null,
    actorRole: "customer",
    action: "payment.receipt_submitted",
    entityType: "payment",
    entityId: payment.id,
    summary: `ثبت رسید کارت‌به‌کارت برای پرداخت ${payment.paymentNumber}`,
    meta: {
      receiptId: receipt.id,
      declaredAmountRial: input.paidAmountRial,
      expectedAmountRial: payment.amountRial,
      amountMatches: amountMatch.matches,
    },
  });

  // اطلاع به تیم مالی؛ شکست آن نباید ثبت رسید را برگرداند.
  await notifyRoles({
    roles: await roleSlugsWithPermission("payment:review"),
    kind: "payment_review_needed",
    body: `رسید جدید برای پرداخت ${payment.paymentNumber} به مبلغ ${formatRial(payment.amountRial)} در صف تایید است.`,
    link: "/admin/payments",
  }).catch((error: unknown) => {
    logger.warn("review notification failed", { error: String(error) });
  });

  return { receiptId: receipt.id, amountWarning: amountMatch.warning };
}

/** انتقال به «در حال بررسی»؛ هنگام باز کردن پرداخت توسط ادمین. */
export async function markUnderReview(
  paymentId: string,
  actorUserId: string,
): Promise<void> {
  const payment = await findPaymentById(paymentId);
  if (!payment || payment.status !== "receipt_submitted") return;

  await updatePaymentStatus(paymentId, {
    status: "under_review",
    reviewedByUserId: actorUserId,
  });
}

/** ثبت وضعیت نهایی پرداخت. اثرات جانبی مسئولیت ماژول settlement است. */
export async function applyReviewDecision(input: {
  paymentId: string;
  decision: "confirmed" | "rejected";
  reason?: string;
  actorUserId: string;
}): Promise<Payment> {
  const payment = await findPaymentById(input.paymentId);
  if (!payment) throw new PaymentError("پرداخت پیدا نشد.");

  if (payment.status === "confirmed") {
    throw new PaymentError("این پرداخت قبلاً تایید شده است.");
  }

  const now = Date.now();

  await updatePaymentStatus(input.paymentId, {
    status: input.decision,
    confirmedAt: input.decision === "confirmed" ? now : null,
    rejectedAt: input.decision === "rejected" ? now : null,
    rejectionReason: input.decision === "rejected" ? (input.reason ?? null) : null,
    reviewedByUserId: input.actorUserId,
  });

  await recordAudit({
    actorUserId: input.actorUserId,
    action: `payment.${input.decision}`,
    entityType: "payment",
    entityId: input.paymentId,
    summary:
      input.decision === "confirmed"
        ? `تایید پرداخت ${payment.paymentNumber} به مبلغ ${formatRial(payment.amountRial)}`
        : `رد پرداخت ${payment.paymentNumber}: ${input.reason ?? "بدون توضیح"}`,
    meta: { amountRial: payment.amountRial, purpose: payment.purpose },
  });

  const updated = await findPaymentById(input.paymentId);
  if (!updated) throw new PaymentError("پرداخت پیدا نشد.");

  return toPayment(updated);
}

/** منقضی کردن پرداخت‌هایی که مهلتشان گذشته؛ برای اجرای دوره‌ای. */
export async function expireStalePayments(): Promise<number> {
  const rows = await findStalePayments(Date.now());

  for (const row of rows) {
    await updatePaymentStatus(row.id, { status: "expired" });
  }

  if (rows.length > 0) {
    logger.info("stale payments expired", { count: rows.length });
  }

  return rows.length;
}

export async function getConfirmedAmountSince(fromAt: number): Promise<number> {
  return sumConfirmedAmount(fromAt);
}

export async function getConfirmedAmountBetween(fromAt: number, toAt: number): Promise<number> {
  return sumConfirmedAmountBetween(fromAt, toAt);
}

export async function listConfirmedSalesBetween(fromAt: number, toAt: number) {
  return findConfirmedSalesBetween(fromAt, toAt);
}

export async function countRejectedSince(fromAt: number, toAt: number): Promise<number> {
  return countRejectedPaymentsBetween(fromAt, toAt);
}

export async function countInReviewQueue(): Promise<number> {
  const rows = await findPaymentsByStatus(["receipt_submitted", "under_review"], 500);
  return rows.length;
}

export async function listPayments(input: {
  status?: PaymentStatus;
  purpose?: PaymentPurpose;
  payerUserId?: string;
  limit: number;
  offset: number;
}): Promise<Payment[]> {
  const rows = await listPaymentRows(input);
  return rows.map(toPayment);
}

export async function countAllPayments(input?: {
  status?: PaymentStatus;
  purpose?: PaymentPurpose;
}): Promise<number> {
  return countPaymentRows(input);
}

export type { PaymentStatus };
