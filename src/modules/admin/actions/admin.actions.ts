"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { confirmContribution } from "@/modules/gifting";
import { getUserById } from "@/modules/identity";
import { sendTemplatedSms } from "@/modules/notifications";
import { settlePaidOrder } from "@/modules/orders";
import {
  applyReviewDecision,
  expireStalePayments,
  getPaymentById,
  markUnderReview,
  PaymentError,
  reviewPaymentSchema,
  type Payment,
} from "@/modules/payments";
import {
  ActionError,
  createAction,
  emptyInput,
  ForbiddenError,
  NotFoundError,
} from "@/server/actions/action-kit";
import { describeError, logger } from "@/server/logger";
import { getMediaFileRecord, softDeleteFile } from "@/server/storage/file-storage";
import { idSchema } from "@/shared/lib/validators";

import { canDeleteMediaFolder, isMediaFolder } from "../domain/media-access";

/**
 * تایید/رد پرداخت و تسویه اثر آن روی سفارش یا مشارکت.
 *
 * settle پس از confirm صدا زده می‌شود و باید idempotent باشد؛ اگر پرداخت
 * از قبل تایید شده باشد، فقط تسویه تکرار می‌شود تا خطای جزئی قابل جبران باشد.
 */
export const reviewAndSettlePayment = createAction({
  name: "admin.reviewAndSettlePayment",
  schema: reviewPaymentSchema,
  auth: "required",
  permissions: ["payment:review"],
  handler: async ({ input, user }) => {
    const current = await getPaymentById(input.paymentId);
    if (!current) throw new NotFoundError("پرداخت پیدا نشد.");

    if (current.status === "confirmed" && input.decision === "rejected") {
      throw new ActionError("این پرداخت قبلاً تایید شده و قابل رد نیست.");
    }

    let payment: Payment = current;

    if (current.status !== "confirmed") {
      try {
        await markUnderReview(input.paymentId, user.id);
        payment = await applyReviewDecision({
          paymentId: input.paymentId,
          decision: input.decision,
          ...(input.reason ? { reason: input.reason } : {}),
          actorUserId: user.id,
        });
      } catch (error) {
        if (error instanceof PaymentError) {
          throw new ActionError(error.message);
        }
        throw error;
      }
    }

    if (payment.status === "confirmed") {
      try {
        if (payment.purpose === "order" && payment.orderId) {
          await settlePaidOrder(payment.orderId, user.id);
        }
        if (payment.purpose === "contribution" && payment.contributionId) {
          await confirmContribution(payment.contributionId, user.id);
        }
      } catch (error) {
        logger.error("payment settlement failed after confirm", {
          paymentId: payment.id,
          purpose: payment.purpose,
          error: describeError(error),
        });
        throw new ActionError(
          "پرداخت تایید شد اما نهایی‌سازی سفارش یا هدیه کامل نشد. دوباره تلاش کنید.",
        );
      }
    }

    if (payment.payerUserId) {
      const payer = await getUserById(payment.payerUserId);
      if (payer?.phone) {
        const smsResult =
          payment.status === "confirmed"
            ? sendTemplatedSms(payer.phone, "paymentConfirmed", {
                paymentNumber: payment.paymentNumber,
              })
            : payment.status === "rejected"
              ? sendTemplatedSms(payer.phone, "paymentRejected", {
                  paymentNumber: payment.paymentNumber,
                  reason: payment.rejectionReason ?? input.reason ?? "بدون توضیح",
                })
              : null;

        if (smsResult) {
          await smsResult.catch((error: unknown) => {
            logger.warn("payment review sms failed", { error: describeError(error) });
          });
        }
      }
    }

    revalidatePath("/admin/payments");

    return { paymentId: payment.id, status: payment.status };
  },
});

export const expireStalePaymentsAction = createAction({
  name: "admin.expireStalePayments",
  schema: emptyInput,
  auth: "required",
  roles: ["super_admin"],
  handler: async () => {
    const count = await expireStalePayments();
    revalidatePath("/admin/payments");
    return { expiredCount: count };
  },
});

const softDeleteMediaFileSchema = z.object({
  fileId: idSchema,
});

export const softDeleteMediaFileAction = createAction({
  name: "admin.softDeleteMediaFile",
  schema: softDeleteMediaFileSchema,
  auth: "required",
  handler: async ({ input, user }) => {
    const record = await getMediaFileRecord(input.fileId);
    if (!record || record.deletedAt) {
      throw new NotFoundError("فایل پیدا نشد.");
    }

    if (!isMediaFolder(record.folder) || !canDeleteMediaFolder(user.roles, record.folder)) {
      throw new ForbiddenError();
    }

    await softDeleteFile(record.id);
    logger.info("media file soft-deleted", {
      fileId: record.id,
      folder: record.folder,
      actorUserId: user.id,
    });
    revalidatePath("/admin/files");
    return { fileId: record.id };
  },
});
