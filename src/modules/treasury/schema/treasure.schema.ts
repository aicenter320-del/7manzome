import { z } from "zod";

import { epochSchema, idSchema, mgSchema, rialSchema } from "@/shared/lib/validators";
import { TREASURE_KINDS, TREASURE_VISIBILITIES } from "@/shared/types/enums";

export const createTreasureSchema = z
  .object({
    childId: idSchema,
    title: z.string().trim().min(2, "عنوان گنجینه الزامی است").max(120),
    kind: z.enum(TREASURE_KINDS),
    occasionSlug: z.string().trim().max(60).optional(),
    eventDateAt: epochSchema.optional(),
    inviteMessage: z.string().trim().max(500).optional(),
    visibility: z.enum(TREASURE_VISIBILITIES).default("private"),
    targetMg: mgSchema.positive("هدف باید بزرگ‌تر از صفر باشد").optional(),
    targetDateAt: epochSchema.optional(),
  })
  .refine((data) => data.kind !== "event" || Boolean(data.eventDateAt), {
    message: "برای گنجینه مناسبتی، تاریخ رویداد الزامی است",
    path: ["eventDateAt"],
  });

export const setGoalSchema = z.object({
  treasureId: idSchema,
  targetMg: mgSchema.positive("هدف باید بزرگ‌تر از صفر باشد"),
  targetDateAt: epochSchema.optional(),
  note: z.string().trim().max(200).optional(),
});

export const editTreasureSchema = z.object({
  treasureId: idSchema,
  title: z.string().trim().min(2).max(120).optional(),
  inviteMessage: z.string().trim().max(500).nullable().optional(),
  visibility: z.enum(TREASURE_VISIBILITIES).optional(),
});

export const changeTreasureStatusSchema = z.object({
  treasureId: idSchema,
  status: z.enum(["active", "closed", "archived"]),
});

export const adjustLedgerSchema = z
  .object({
    treasureId: idSchema,
    direction: z.enum(["in", "out"]),
    amountMg: mgSchema.positive("مقدار طلا باید بزرگ‌تر از صفر باشد"),
    karat: z.union([z.literal(18), z.literal(24)]),
    note: z.string().trim().min(5, "ذکر دلیل تعدیل الزامی است").max(300),
  })
  .strict();

export const recordGoldCoverSchema = z
  .object({
    amountMg: mgSchema.positive("وزن طلا باید بزرگ‌تر از صفر باشد"),
    karat: z.union([z.literal(18), z.literal(24)]),
    paidRial: rialSchema.positive("مبلغ باید بزرگ‌تر از صفر باشد").optional(),
    purchasedAt: epochSchema,
    note: z.string().trim().max(300).optional(),
  })
  .strict();
