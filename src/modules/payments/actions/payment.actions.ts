"use server";

import { revalidatePath } from "next/cache";

import {
  ActionError,
  createAction,
  ForbiddenError,
  type ActionResult,
} from "@/server/actions/action-kit";
import { hasPermission } from "@/server/auth/rbac";
import { getSessionUser } from "@/server/auth/session";
import { describeError, logger } from "@/server/logger";
import { FileValidationError, saveUploadedFile } from "@/server/storage/file-storage";
import { idSchema } from "@/shared/lib/validators";
import type { UserRole } from "@/shared/types/enums";

import {
  createBankAccountSchema,
  reviewPaymentSchema,
  submitReceiptSchema,
  toggleBankAccountSchema,
} from "../schema/payment.schema";
import {
  applyReviewDecision,
  createBankAccount,
  DuplicateReferenceError,
  getPaymentById,
  markUnderReview,
  PaymentError,
  submitCardReceipt,
  toggleBankAccount,
} from "../service/payment.service";

function rethrowPaymentError(error: unknown): never {
  if (error instanceof DuplicateReferenceError) {
    throw new ActionError(error.message, { referenceNumber: [error.message] });
  }
  if (error instanceof PaymentError) {
    throw new ActionError(error.message);
  }
  if (error instanceof FileValidationError) {
    throw new ActionError(error.message);
  }
  throw error;
}

function assertBankAccountPermission(roles: readonly UserRole[]): void {
  if (!hasPermission(roles, "settings:write") && !hasPermission(roles, "payment:review")) {
    throw new ForbiddenError();
  }
}

/**
 * آپلود فایل رسید. استثنا بر createAction چون ورودی multipart است.
 * کلاینت ابتدا این اکشن را صدا می‌زند و fileId را به submitReceiptAction می‌دهد.
 */
export async function uploadPaymentReceipt(
  formData: FormData,
): Promise<ActionResult<{ fileId: string }>> {
  const paymentIdParsed = idSchema.safeParse(formData.get("paymentId"));
  if (!paymentIdParsed.success) {
    return { ok: false, error: "شناسه پرداخت نامعتبر است." };
  }

  const fileRaw = formData.get("file");
  if (!(fileRaw instanceof File) || fileRaw.size === 0) {
    return { ok: false, error: "تصویر یا فایل رسید را انتخاب کنید." };
  }

  const payment = await getPaymentById(paymentIdParsed.data);
  if (!payment) {
    return { ok: false, error: "پرداخت پیدا نشد." };
  }

  const user = await getSessionUser();

  try {
    const saved = await saveUploadedFile({
      file: fileRaw,
      folder: "receipts",
      visibility: "private",
      uploadedByUserId: user?.id ?? null,
    });

    return { ok: true, data: { fileId: saved.id } };
  } catch (error) {
    if (error instanceof FileValidationError) {
      return { ok: false, error: error.message };
    }

    logger.error("receipt upload failed", { error: describeError(error) });
    return { ok: false, error: "آپلود رسید با خطا مواجه شد. لطفاً دوباره تلاش کنید." };
  }
}

export const submitReceiptAction = createAction({
  name: "payments.submitReceipt",
  schema: submitReceiptSchema,
  auth: "guest",
  handler: async ({ input, user }) => {
    try {
      const result = await submitCardReceipt({
        paymentId: input.paymentId,
        referenceNumber: input.referenceNumber,
        paidAmountRial: input.paidAmountRial,
        payerName: input.payerName,
        ...(input.payerCardLast4 ? { payerCardLast4: input.payerCardLast4 } : {}),
        ...(input.bankName ? { bankName: input.bankName } : {}),
        paidAt: input.paidAt,
        ...(input.receiptFileId ? { receiptFileId: input.receiptFileId } : {}),
        ...(input.note ? { note: input.note } : {}),
        actorUserId: user?.id ?? null,
      });

      revalidatePath(`/checkout/payment/${input.paymentId}`);

      return result;
    } catch (error) {
      rethrowPaymentError(error);
    }
  },
});

/**
 * تایید یا رد پرداخت بدون تسویه سفارش/مشارکت.
 * تسویه مسئولیت ماژول admin است تا دور در گراف وابستگی ساخته نشود.
 */
export const reviewPaymentAction = createAction({
  name: "payments.reviewPayment",
  schema: reviewPaymentSchema,
  auth: "required",
  permissions: ["payment:review"],
  handler: async ({ input, user }) => {
    try {
      await markUnderReview(input.paymentId, user.id);
      const payment = await applyReviewDecision({
        paymentId: input.paymentId,
        decision: input.decision,
        ...(input.reason ? { reason: input.reason } : {}),
        actorUserId: user.id,
      });

      revalidatePath("/admin/payments");

      return { paymentId: payment.id, status: payment.status };
    } catch (error) {
      rethrowPaymentError(error);
    }
  },
});

export const createBankAccountAction = createAction({
  name: "payments.createBankAccount",
  schema: createBankAccountSchema,
  auth: "required",
  handler: async ({ input, user }) => {
    assertBankAccountPermission(user.roles);

    try {
      const account = await createBankAccount({
        title: input.title,
        bankName: input.bankName,
        cardNumber: input.cardNumber,
        ...(input.iban ? { iban: input.iban } : {}),
        accountHolder: input.accountHolder,
        sortOrder: input.sortOrder,
        actorUserId: user.id,
      });

      revalidatePath("/admin/bank-accounts");

      return { bankAccountId: account.id };
    } catch (error) {
      rethrowPaymentError(error);
    }
  },
});

export const toggleBankAccountAction = createAction({
  name: "payments.toggleBankAccount",
  schema: toggleBankAccountSchema,
  auth: "required",
  handler: async ({ input, user }) => {
    assertBankAccountPermission(user.roles);

    try {
      await toggleBankAccount({
        bankAccountId: input.bankAccountId,
        isActive: input.isActive,
        actorUserId: user.id,
      });

      revalidatePath("/admin/bank-accounts");

      return { ok: true as const };
    } catch (error) {
      rethrowPaymentError(error);
    }
  },
});
