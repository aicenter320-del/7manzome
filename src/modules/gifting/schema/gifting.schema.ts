import { z } from "zod";

import {
  epochSchema,
  giftTokenSchema,
  idSchema,
  phoneSchema,
  rialSchema,
} from "@/shared/lib/validators";

export const createGiftLinkSchema = z.object({
  treasureId: idSchema,
  title: z.string().trim().min(2, "عنوان لینک هدیه الزامی است").max(120),
  message: z.string().trim().max(500).optional(),
  suggestedAmountsRial: z.array(z.number().int().positive()).min(1).max(6).optional(),
  expiresAt: epochSchema.optional(),
});

export const giftLinkIdSchema = z.object({
  giftLinkId: idSchema,
});

export const startContributionSchema = z.object({
  token: giftTokenSchema,
  contributorName: z.string().trim().min(2, "نام باید حداقل ۲ حرف باشد").max(80),
  contributorPhone: z
    .union([z.literal(""), phoneSchema])
    .optional()
    .transform((value) => (value === "" || value === undefined ? undefined : value)),
  relationLabel: z.string().trim().max(40).optional(),
  amountRial: rialSchema.positive("مبلغ باید بزرگ‌تر از صفر باشد"),
  keepsakeMessage: z.string().trim().max(300, "پیام یادگاری حداکثر ۳۰۰ حرف است").optional(),
  isAnonymous: z.boolean().default(false),
});

export const saveKeepsakeSchema = z.object({
  contributionId: idSchema,
  message: z.string().trim().max(300, "پیام یادگاری حداکثر ۳۰۰ حرف است"),
});

export const createGiftCardsSchema = z.object({
  count: z.number().int().min(1, "حداقل یک کارت لازم است").max(100, "حداکثر ۱۰۰ کارت در هر نوبت"),
  design: z.string().trim().max(40).optional(),
  treasureId: idSchema.optional(),
});

export const redeemGiftCardSchema = z.object({
  code: z.string().trim().min(4, "کد کارت معتبر نیست").max(20, "کد کارت معتبر نیست"),
});
