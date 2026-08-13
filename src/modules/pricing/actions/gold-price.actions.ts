"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createAction } from "@/server/actions/action-kit";
import { recordAudit } from "@/server/audit";
import { GOLD_KARATS } from "@/shared/types/enums";

import { recordManualPrice, refreshFromProvider } from "../service/gold-price.service";

const karatSchema = z.union([z.literal(18), z.literal(24)]);

const setPriceSchema = z.object({
  karat: karatSchema,
  /** قیمت هر گرم به ریال. */
  pricePerGramRial: z
    .number()
    .int("قیمت باید عدد صحیح ریالی باشد")
    .positive("قیمت باید بزرگ‌تر از صفر باشد")
    .max(1_000_000_000_000, "قیمت وارد‌شده غیرمنطقی است"),
  note: z.string().trim().max(200).optional(),
});

export const setManualGoldPrice = createAction({
  name: "pricing.setManualGoldPrice",
  schema: setPriceSchema,
  auth: "required",
  permissions: ["gold_price:write"],
  handler: async ({ input, user }) => {
    const price = await recordManualPrice({
      karat: input.karat,
      pricePerGramRial: input.pricePerGramRial,
      ...(input.note ? { note: input.note } : {}),
      actorUserId: user.id,
    });

    await recordAudit({
      actorUserId: user.id,
      action: "gold_price.set",
      entityType: "gold_price",
      summary: `ثبت قیمت طلای ${input.karat} عیار: ${input.pricePerGramRial} ریال بر گرم`,
      meta: { karat: input.karat, pricePerGramRial: input.pricePerGramRial },
    });

    revalidatePath("/", "layout");

    return price;
  },
});

export const refreshExternalGoldPrice = createAction({
  name: "pricing.refreshExternalGoldPrice",
  schema: z.object({}),
  auth: "required",
  permissions: ["gold_price:write"],
  handler: async ({ user }) => {
    const updated: Array<{ karat: number; pricePerGramRial: number }> = [];

    for (const karat of GOLD_KARATS) {
      const price = await refreshFromProvider(karat);
      if (price) {
        updated.push({ karat, pricePerGramRial: price.pricePerGramRial });
      }
    }

    if (updated.length === 0) {
      return { updated, message: "منبع بیرونی قیمتی برنگرداند." };
    }

    await recordAudit({
      actorUserId: user.id,
      action: "gold_price.refresh_external",
      entityType: "gold_price",
      summary: `به‌روزرسانی قیمت از منبع بیرونی برای ${updated.length} عیار`,
      meta: { updated },
    });

    revalidatePath("/", "layout");

    return { updated, message: "قیمت‌ها به‌روزرسانی شدند." };
  },
});
