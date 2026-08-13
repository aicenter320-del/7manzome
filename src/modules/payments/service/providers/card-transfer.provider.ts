import "server-only";

import { getSetting } from "@/modules/content";
import { currentJalaliYear, fromJalali } from "@/shared/lib/jalali";

import { buildPaymentNumber } from "../../domain/payment-status";
import type {
  InitiatePaymentInput,
  InitiatePaymentResult,
  PaymentProvider,
} from "../../domain/types";
import {
  findActiveBankAccounts,
  insertPayment,
  nextPaymentSequence,
} from "../../repo/payment.repo";

/**
 * پرداخت کارت‌به‌کارت.
 *
 * تنها روش فعال MVP. کاربر شماره کارت را می‌بیند، واریز می‌کند، رسید را
 * آپلود می‌کند و ادمین آن را تایید یا رد می‌کند (ADR-0008).
 */
export const cardTransferProvider: PaymentProvider = {
  key: "card_transfer",
  label: "کارت به کارت",
  requiresManualReview: true,
  isEnabled: true,

  async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    const [deadlineHours, accounts] = await Promise.all([
      getSetting("payment.card_transfer_deadline_hours"),
      findActiveBankAccounts(),
    ]);

    const account = accounts[0];

    if (!account) {
      throw new Error(
        "هیچ حساب بانکی فعالی برای دریافت کارت‌به‌کارت ثبت نشده است. با پشتیبانی تماس بگیرید.",
      );
    }

    const year = currentJalaliYear();
    const sequence = await nextPaymentSequence(fromJalali({ year, month: 1, day: 1 }));
    const expiresAt = Date.now() + deadlineHours * 3_600_000;

    const payment = await insertPayment({
      paymentNumber: buildPaymentNumber(year, sequence),
      provider: "card_transfer",
      purpose: input.purpose,
      orderId: input.orderId ?? null,
      contributionId: input.contributionId ?? null,
      payerUserId: input.payerUserId ?? null,
      amountRial: input.amountRial,
      bankAccountId: account.id,
      expiresAt,
    });

    return {
      paymentId: payment.id,
      paymentNumber: payment.paymentNumber,
      nextUrl: `/pay/${payment.id}`,
      expiresAt,
    };
  },
};
