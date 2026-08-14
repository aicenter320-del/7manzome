"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  archiveAsAdmin,
  BirthDateError,
  ChildAccessError,
  editChildAsAdmin,
  getChildrenForUser,
  updateChildSchema,
} from "@/modules/children";
import {
  closeGiftLinkAsAdmin,
  confirmContribution,
  GiftCardError,
  GiftLinkError,
  GiftLinkInactiveError,
  giftLinkIdSchema,
  pauseGiftLinkAsAdmin,
  resumeGiftLinkAsAdmin,
  voidGiftCard,
} from "@/modules/gifting";
import { deleteUserAccount, getUserById, UserDeleteError } from "@/modules/identity";
import { sendTemplatedSms } from "@/modules/notifications";
import { getOrdersForUser, settlePaidOrder } from "@/modules/orders";
import {
  changeTreasureStatusAsAdmin,
  changeTreasureStatusSchema,
  deleteEmptyTreasureAsAdmin,
  editTreasureAsAdmin,
  editTreasureSchema,
  getTreasuresForUser,
  TreasureAccessError,
  TreasureNotEmptyError,
} from "@/modules/treasury";
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

function revalidateAdminUser(userId: string) {
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

const adminUserIdSchema = z.object({ userId: idSchema });
const adminChildUpdateSchema = updateChildSchema.extend({ userId: idSchema });
const adminChildIdSchema = z.object({ childId: idSchema, userId: idSchema });
const adminTreasureEditSchema = editTreasureSchema.extend({ userId: idSchema });
const adminTreasureStatusSchema = changeTreasureStatusSchema.extend({ userId: idSchema });
const adminTreasureIdSchema = z.object({ treasureId: idSchema, userId: idSchema });
const adminGiftLinkSchema = giftLinkIdSchema.extend({ userId: idSchema });
const adminGiftCardSchema = z.object({ giftCardId: idSchema, userId: idSchema });

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

export const deleteAdminUser = createAction({
  name: "admin.deleteUser",
  schema: adminUserIdSchema,
  auth: "required",
  permissions: ["user:write"],
  handler: async ({ input, user }) => {
    if (input.userId === user.id) {
      throw new ActionError("نمی‌توانید حساب خودتان را حذف کنید.");
    }

    const [orders, treasures] = await Promise.all([
      getOrdersForUser(input.userId, { limit: 1 }),
      getTreasuresForUser(input.userId, { includeArchived: true }),
    ]);

    if (orders.total > 0 || treasures.length > 0) {
      throw new ActionError(
        "این کاربر سفارش یا گنجینه دارد و حذف نمی‌شود. می‌توانید حساب را مسدود کنید.",
      );
    }

    try {
      await deleteUserAccount(input.userId, user.id);
    } catch (error) {
      if (error instanceof UserDeleteError) {
        throw new ActionError(error.message);
      }
      logger.warn("user delete blocked by related records", {
        userId: input.userId,
        error: describeError(error),
      });
      throw new ActionError(
        "حذف این حساب ممکن نیست چون ردپای دیگری دارد. می‌توانید حساب را مسدود کنید.",
      );
    }

    revalidatePath("/admin/users");
    return { deleted: true as const };
  },
});

export const adminUpdateChild = createAction({
  name: "admin.updateChild",
  schema: adminChildUpdateSchema,
  auth: "required",
  permissions: ["user:write"],
  handler: async ({ input, user }) => {
    const children = await getChildrenForUser(input.userId, { includeArchived: true });
    if (!children.some((child) => child.id === input.childId)) {
      throw new NotFoundError("پروفایل کودک پیدا نشد.");
    }

    try {
      await editChildAsAdmin({
        childId: input.childId,
        actorUserId: user.id,
        ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
        ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
        ...(input.nameEn !== undefined ? { nameEn: input.nameEn } : {}),
        ...(input.gender !== undefined ? { gender: input.gender } : {}),
        ...(input.birthDateAt !== undefined ? { birthDateAt: input.birthDateAt } : {}),
        ...(input.note !== undefined ? { note: input.note } : {}),
      });
    } catch (error) {
      if (error instanceof BirthDateError) {
        throw new ActionError(error.message, { birthDateAt: [error.message] });
      }
      if (error instanceof ChildAccessError) {
        throw new ActionError(error.message);
      }
      throw error;
    }

    revalidateAdminUser(input.userId);
    return { ok: true as const };
  },
});

export const adminArchiveChild = createAction({
  name: "admin.archiveChild",
  schema: adminChildIdSchema,
  auth: "required",
  permissions: ["user:write"],
  handler: async ({ input, user }) => {
    const children = await getChildrenForUser(input.userId, { includeArchived: true });
    if (!children.some((child) => child.id === input.childId)) {
      throw new NotFoundError("پروفایل کودک پیدا نشد.");
    }

    try {
      await archiveAsAdmin(input.childId, user.id);
    } catch (error) {
      if (error instanceof ChildAccessError) {
        throw new ActionError(error.message);
      }
      throw error;
    }

    revalidateAdminUser(input.userId);
    return { ok: true as const };
  },
});

export const adminUpdateTreasure = createAction({
  name: "admin.updateTreasure",
  schema: adminTreasureEditSchema,
  auth: "required",
  permissions: ["user:write"],
  handler: async ({ input, user }) => {
    const treasures = await getTreasuresForUser(input.userId, { includeArchived: true });
    if (!treasures.some((item) => item.treasure.id === input.treasureId)) {
      throw new NotFoundError("گنجینه پیدا نشد.");
    }

    try {
      await editTreasureAsAdmin({
        treasureId: input.treasureId,
        actorUserId: user.id,
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.inviteMessage !== undefined ? { inviteMessage: input.inviteMessage } : {}),
        ...(input.visibility !== undefined ? { visibility: input.visibility } : {}),
      });
    } catch (error) {
      if (error instanceof TreasureAccessError) {
        throw new ActionError(error.message);
      }
      throw error;
    }

    revalidateAdminUser(input.userId);
    return { ok: true as const };
  },
});

export const adminChangeTreasureStatus = createAction({
  name: "admin.changeTreasureStatus",
  schema: adminTreasureStatusSchema,
  auth: "required",
  permissions: ["user:write"],
  handler: async ({ input, user }) => {
    const treasures = await getTreasuresForUser(input.userId, { includeArchived: true });
    if (!treasures.some((item) => item.treasure.id === input.treasureId)) {
      throw new NotFoundError("گنجینه پیدا نشد.");
    }

    try {
      await changeTreasureStatusAsAdmin({
        treasureId: input.treasureId,
        actorUserId: user.id,
        status: input.status,
      });
    } catch (error) {
      if (error instanceof TreasureAccessError) {
        throw new ActionError(error.message);
      }
      throw error;
    }

    revalidateAdminUser(input.userId);
    return { ok: true as const };
  },
});

export const adminDeleteEmptyTreasure = createAction({
  name: "admin.deleteEmptyTreasure",
  schema: adminTreasureIdSchema,
  auth: "required",
  permissions: ["user:write"],
  handler: async ({ input, user }) => {
    const treasures = await getTreasuresForUser(input.userId, { includeArchived: true });
    if (!treasures.some((item) => item.treasure.id === input.treasureId)) {
      throw new NotFoundError("گنجینه پیدا نشد.");
    }

    try {
      await deleteEmptyTreasureAsAdmin(input.treasureId, user.id);
    } catch (error) {
      if (error instanceof TreasureNotEmptyError || error instanceof TreasureAccessError) {
        throw new ActionError(error.message);
      }
      throw error;
    }

    revalidateAdminUser(input.userId);
    return { ok: true as const };
  },
});

export const adminPauseGiftLink = createAction({
  name: "admin.pauseGiftLink",
  schema: adminGiftLinkSchema,
  auth: "required",
  permissions: ["user:write"],
  handler: async ({ input }) => {
    try {
      await pauseGiftLinkAsAdmin(input.giftLinkId);
    } catch (error) {
      if (error instanceof GiftLinkError || error instanceof GiftLinkInactiveError) {
        throw new ActionError(error.message);
      }
      throw error;
    }
    revalidateAdminUser(input.userId);
    return { ok: true as const };
  },
});

export const adminResumeGiftLink = createAction({
  name: "admin.resumeGiftLink",
  schema: adminGiftLinkSchema,
  auth: "required",
  permissions: ["user:write"],
  handler: async ({ input }) => {
    try {
      await resumeGiftLinkAsAdmin(input.giftLinkId);
    } catch (error) {
      if (error instanceof GiftLinkError || error instanceof GiftLinkInactiveError) {
        throw new ActionError(error.message);
      }
      throw error;
    }
    revalidateAdminUser(input.userId);
    return { ok: true as const };
  },
});

export const adminCloseGiftLink = createAction({
  name: "admin.closeGiftLink",
  schema: adminGiftLinkSchema,
  auth: "required",
  permissions: ["user:write"],
  handler: async ({ input }) => {
    try {
      await closeGiftLinkAsAdmin(input.giftLinkId);
    } catch (error) {
      if (error instanceof GiftLinkError || error instanceof GiftLinkInactiveError) {
        throw new ActionError(error.message);
      }
      throw error;
    }
    revalidateAdminUser(input.userId);
    return { ok: true as const };
  },
});

export const adminVoidGiftCard = createAction({
  name: "admin.voidGiftCard",
  schema: adminGiftCardSchema,
  auth: "required",
  permissions: ["user:write"],
  handler: async ({ input, user }) => {
    try {
      await voidGiftCard(input.giftCardId, user.id);
    } catch (error) {
      if (error instanceof GiftCardError) {
        throw new ActionError(error.message);
      }
      throw error;
    }
    revalidateAdminUser(input.userId);
    return { ok: true as const };
  },
});
