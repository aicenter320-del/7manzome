import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import type {
  PaymentProviderKey,
  PaymentPurpose,
  PaymentStatus,
} from "@/shared/types/enums";

import {
  boolean,
  counter,
  createdAt,
  idRef,
  primaryId,
  rial,
  timestamp,
  updatedAt,
} from "../columns";
import { contributions } from "./gifting";
import { users } from "./identity";
import { mediaFiles } from "./media";
import { orders } from "./orders";

/** شماره کارت‌های مقصد کارت‌به‌کارت؛ قابل مدیریت از پنل ادمین. */
export const bankAccounts = sqliteTable(
  "bank_accounts",
  {
    id: primaryId(),
    title: text("title").notNull(),
    bankName: text("bank_name").notNull(),
    cardNumber: text("card_number").notNull(),
    iban: text("iban"),
    accountHolder: text("account_holder").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: counter("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("bank_accounts_is_active_idx").on(table.isActive)],
);

/**
 * پرداخت.
 *
 * یکی از orderId یا contributionId پر است، بسته به purpose.
 * تنها گذار به وضعیت confirmed است که باعث ثبت طلا در دفتر کل می‌شود.
 */
export const payments = sqliteTable(
  "payments",
  {
    id: primaryId(),

    /** شماره قابل‌نمایش با الگوی PM-<سال شمسی>-<شماره ترتیبی>. */
    paymentNumber: text("payment_number").notNull(),

    provider: text("provider").$type<PaymentProviderKey>().notNull(),
    purpose: text("purpose").$type<PaymentPurpose>().notNull(),

    orderId: idRef("order_id").references(() => orders.id, { onDelete: "cascade" }),
    contributionId: idRef("contribution_id").references(() => contributions.id, {
      onDelete: "cascade",
    }),

    /** پرداخت‌کننده؛ برای مهمان بدون حساب خالی است. */
    payerUserId: idRef("payer_user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    amountRial: rial("amount_rial").notNull(),

    /** حساب مقصدی که به کاربر نمایش داده شد. */
    bankAccountId: idRef("bank_account_id").references(() => bankAccounts.id, {
      onDelete: "set null",
    }),

    status: text("status").$type<PaymentStatus>().notNull().default("awaiting_transfer"),

    /** مهلت پرداخت؛ پس از آن وضعیت expired می‌شود. */
    expiresAt: timestamp("expires_at"),

    confirmedAt: timestamp("confirmed_at"),
    rejectedAt: timestamp("rejected_at"),
    rejectionReason: text("rejection_reason"),

    /** ادمینی که تایید یا رد کرده؛ برای حسابرسی و تفکیک وظایف. */
    reviewedByUserId: idRef("reviewed_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("payments_payment_number_unique").on(table.paymentNumber),
    index("payments_status_idx").on(table.status),
    index("payments_order_idx").on(table.orderId),
    index("payments_contribution_idx").on(table.contributionId),
    index("payments_created_at_idx").on(table.createdAt),
  ],
);

/**
 * رسید کارت‌به‌کارت.
 *
 * referenceNumber در کل سیستم یکتاست تا یک رسید دو بار پذیرفته نشود.
 * این مهم‌ترین محافظت این روش پرداخت است. (ADR-0008)
 */
export const cardTransferReceipts = sqliteTable(
  "card_transfer_receipts",
  {
    id: primaryId(),
    paymentId: idRef("payment_id")
      .notNull()
      .references(() => payments.id, { onDelete: "cascade" }),

    /** شماره پیگیری تراکنش بانکی؛ یکتا در کل سیستم. */
    referenceNumber: text("reference_number").notNull(),

    /** مبلغی که کاربر اعلام کرده؛ با amountRial پرداخت مقایسه می‌شود. */
    paidAmountRial: rial("paid_amount_rial").notNull(),

    payerName: text("payer_name").notNull(),

    /** فقط چهار رقم آخر کارت؛ شماره کامل کارت ذخیره نمی‌شود. */
    payerCardLast4: text("payer_card_last4"),
    bankName: text("bank_name"),
    paidAt: timestamp("paid_at").notNull(),

    /** تصویر رسید؛ همیشه فایل private. */
    receiptFileId: idRef("receipt_file_id").references(() => mediaFiles.id, {
      onDelete: "set null",
    }),

    note: text("note"),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("card_transfer_receipts_reference_unique").on(table.referenceNumber),
    index("card_transfer_receipts_payment_idx").on(table.paymentId),
  ],
);
