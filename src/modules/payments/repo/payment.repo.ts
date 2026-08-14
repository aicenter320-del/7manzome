import "server-only";

import { and, asc, count, desc, eq, gte, inArray, lt, sum, type SQL } from "drizzle-orm";

import { db } from "@/server/db";
import { bankAccounts, cardTransferReceipts, payments } from "@/server/db/schema";
import type {
  BankAccountRow,
  CardTransferReceiptRow,
  PaymentRow,
} from "@/server/db/types";
import type {
  PaymentProviderKey,
  PaymentPurpose,
  PaymentStatus,
} from "@/shared/types/enums";

export async function findPaymentById(paymentId: string): Promise<PaymentRow | null> {
  const rows = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
  return rows[0] ?? null;
}

export async function findPaymentsForOrder(orderId: string): Promise<PaymentRow[]> {
  return db
    .select()
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .orderBy(desc(payments.createdAt));
}

export async function findPaymentForContribution(
  contributionId: string,
): Promise<PaymentRow | null> {
  const rows = await db
    .select()
    .from(payments)
    .where(eq(payments.contributionId, contributionId))
    .orderBy(desc(payments.createdAt))
    .limit(1);

  return rows[0] ?? null;
}

export async function findPaymentsByStatus(
  statuses: readonly PaymentStatus[],
  limit = 100,
): Promise<PaymentRow[]> {
  return db
    .select()
    .from(payments)
    .where(inArray(payments.status, [...statuses]))
    .orderBy(asc(payments.createdAt))
    .limit(limit);
}

/** شماره ترتیبی بعدی پرداخت در سال شمسی جاری. */
export async function nextPaymentSequence(yearStartAt: number): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(payments)
    .where(gte(payments.createdAt, yearStartAt));

  return (rows[0]?.value ?? 0) + 1;
}

export async function insertPayment(input: {
  paymentNumber: string;
  provider: PaymentProviderKey;
  purpose: PaymentPurpose;
  orderId?: string | null;
  contributionId?: string | null;
  payerUserId?: string | null;
  amountRial: number;
  bankAccountId?: string | null;
  expiresAt?: number | null;
}): Promise<PaymentRow> {
  const [row] = await db
    .insert(payments)
    .values({
      paymentNumber: input.paymentNumber,
      provider: input.provider,
      purpose: input.purpose,
      orderId: input.orderId ?? null,
      contributionId: input.contributionId ?? null,
      payerUserId: input.payerUserId ?? null,
      amountRial: input.amountRial,
      bankAccountId: input.bankAccountId ?? null,
      expiresAt: input.expiresAt ?? null,
    })
    .returning();

  if (!row) throw new Error("ساخت پرداخت شکست خورد.");

  return row;
}

export async function updatePaymentStatus(
  paymentId: string,
  input: {
    status: PaymentStatus;
    confirmedAt?: number | null;
    rejectedAt?: number | null;
    rejectionReason?: string | null;
    reviewedByUserId?: string | null;
  },
): Promise<void> {
  await db
    .update(payments)
    .set({
      status: input.status,
      ...(input.confirmedAt !== undefined ? { confirmedAt: input.confirmedAt } : {}),
      ...(input.rejectedAt !== undefined ? { rejectedAt: input.rejectedAt } : {}),
      ...(input.rejectionReason !== undefined
        ? { rejectionReason: input.rejectionReason }
        : {}),
      ...(input.reviewedByUserId !== undefined
        ? { reviewedByUserId: input.reviewedByUserId }
        : {}),
    })
    .where(eq(payments.id, paymentId));
}

/** پرداخت‌هایی که مهلتشان گذشته و باید منقضی شوند. */
export async function findStalePayments(nowMs: number): Promise<PaymentRow[]> {
  return db
    .select()
    .from(payments)
    .where(
      and(
        inArray(payments.status, ["awaiting_transfer", "rejected"]),
        lt(payments.expiresAt, nowMs),
      ),
    )
    .limit(200);
}

// ------------------------------------------------------------------
// رسید
// ------------------------------------------------------------------

export async function insertReceipt(input: {
  paymentId: string;
  referenceNumber: string;
  paidAmountRial: number;
  payerName: string;
  payerCardLast4?: string | null;
  bankName?: string | null;
  paidAt: number;
  receiptFileId?: string | null;
  note?: string | null;
}): Promise<CardTransferReceiptRow> {
  const [row] = await db
    .insert(cardTransferReceipts)
    .values({
      paymentId: input.paymentId,
      referenceNumber: input.referenceNumber,
      paidAmountRial: input.paidAmountRial,
      payerName: input.payerName,
      payerCardLast4: input.payerCardLast4 ?? null,
      bankName: input.bankName ?? null,
      paidAt: input.paidAt,
      receiptFileId: input.receiptFileId ?? null,
      note: input.note ?? null,
    })
    .returning();

  if (!row) throw new Error("ثبت رسید شکست خورد.");

  return row;
}

export async function findReceiptsForPayment(
  paymentId: string,
): Promise<CardTransferReceiptRow[]> {
  return db
    .select()
    .from(cardTransferReceipts)
    .where(eq(cardTransferReceipts.paymentId, paymentId))
    .orderBy(desc(cardTransferReceipts.createdAt));
}

/** بررسی یکتایی شماره پیگیری؛ مهم‌ترین محافظت روش کارت‌به‌کارت. */
export async function referenceNumberExists(referenceNumber: string): Promise<boolean> {
  const rows = await db
    .select({ id: cardTransferReceipts.id })
    .from(cardTransferReceipts)
    .where(eq(cardTransferReceipts.referenceNumber, referenceNumber))
    .limit(1);

  return rows.length > 0;
}

// ------------------------------------------------------------------
// حساب بانکی
// ------------------------------------------------------------------

export async function findActiveBankAccounts(): Promise<BankAccountRow[]> {
  return db
    .select()
    .from(bankAccounts)
    .where(eq(bankAccounts.isActive, true))
    .orderBy(asc(bankAccounts.sortOrder));
}

export async function findAllBankAccounts(): Promise<BankAccountRow[]> {
  return db.select().from(bankAccounts).orderBy(asc(bankAccounts.sortOrder));
}

export async function findBankAccountById(id: string): Promise<BankAccountRow | null> {
  const rows = await db.select().from(bankAccounts).where(eq(bankAccounts.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function insertBankAccount(input: {
  title: string;
  bankName: string;
  cardNumber: string;
  iban?: string | null;
  accountHolder: string;
  sortOrder?: number;
}): Promise<BankAccountRow> {
  const [row] = await db
    .insert(bankAccounts)
    .values({
      title: input.title,
      bankName: input.bankName,
      cardNumber: input.cardNumber,
      iban: input.iban ?? null,
      accountHolder: input.accountHolder,
      sortOrder: input.sortOrder ?? 0,
    })
    .returning();

  if (!row) throw new Error("ثبت حساب بانکی شکست خورد.");

  return row;
}

export async function setBankAccountActive(id: string, isActive: boolean): Promise<void> {
  await db.update(bankAccounts).set({ isActive }).where(eq(bankAccounts.id, id));
}

// ------------------------------------------------------------------
// گزارش
// ------------------------------------------------------------------

/** جمع پرداخت‌های تاییدشده در یک بازه؛ مبنای عدد «فروش امروز». */
export async function sumConfirmedAmount(fromAt: number): Promise<number> {
  const rows = await db
    .select({ value: sum(payments.amountRial) })
    .from(payments)
    .where(and(eq(payments.status, "confirmed"), gte(payments.confirmedAt, fromAt)));

  return Number(rows[0]?.value ?? 0);
}

export async function sumConfirmedAmountBetween(fromAt: number, toAt: number): Promise<number> {
  const rows = await db
    .select({ value: sum(payments.amountRial) })
    .from(payments)
    .where(
      and(
        eq(payments.status, "confirmed"),
        gte(payments.confirmedAt, fromAt),
        lt(payments.confirmedAt, toAt),
      ),
    );

  return Number(rows[0]?.value ?? 0);
}

export interface ConfirmedSaleSlice {
  confirmedAt: number;
  amountRial: number;
}

export async function findConfirmedSalesBetween(
  fromAt: number,
  toAt: number,
): Promise<ConfirmedSaleSlice[]> {
  const rows = await db
    .select({
      confirmedAt: payments.confirmedAt,
      amountRial: payments.amountRial,
    })
    .from(payments)
    .where(
      and(
        eq(payments.status, "confirmed"),
        gte(payments.confirmedAt, fromAt),
        lt(payments.confirmedAt, toAt),
      ),
    );

  return rows.filter((row): row is ConfirmedSaleSlice => row.confirmedAt !== null);
}

export async function countRejectedPaymentsBetween(fromAt: number, toAt: number): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(payments)
    .where(
      and(
        eq(payments.status, "rejected"),
        gte(payments.rejectedAt, fromAt),
        lt(payments.rejectedAt, toAt),
      ),
    );

  return rows[0]?.value ?? 0;
}

export async function countPaymentsByStatus(status: PaymentStatus): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(payments)
    .where(eq(payments.status, status));

  return rows[0]?.value ?? 0;
}

export async function listPayments(input: {
  status?: PaymentStatus;
  purpose?: PaymentPurpose;
  payerUserId?: string;
  limit: number;
  offset: number;
}): Promise<PaymentRow[]> {
  const conditions: SQL[] = [];
  if (input.status) conditions.push(eq(payments.status, input.status));
  if (input.purpose) conditions.push(eq(payments.purpose, input.purpose));
  if (input.payerUserId) conditions.push(eq(payments.payerUserId, input.payerUserId));

  return db
    .select()
    .from(payments)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(payments.createdAt))
    .limit(input.limit)
    .offset(input.offset);
}

export async function countAllPayments(input?: {
  status?: PaymentStatus;
  purpose?: PaymentPurpose;
}): Promise<number> {
  const conditions: SQL[] = [];
  if (input?.status) conditions.push(eq(payments.status, input.status));
  if (input?.purpose) conditions.push(eq(payments.purpose, input.purpose));

  const rows = await db
    .select({ value: count() })
    .from(payments)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return rows[0]?.value ?? 0;
}
