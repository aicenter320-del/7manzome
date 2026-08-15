import { z } from "zod";

import { isCityInProvince, isIranProvince } from "@/shared/data/iran-places";
import { idSchema, phoneSchema, postalCodeSchema } from "@/shared/lib/validators";
import { ORDER_STATUSES, SHIPMENT_STATUSES } from "@/shared/types/enums";

const quantitySchema = z
  .number()
  .int("تعداد باید عدد صحیح باشد")
  .positive("تعداد باید بزرگ‌تر از صفر باشد")
  .max(20, "حداکثر ۲۰ عدد از هر قلم می‌توانید بخرید");

export const addToCartSchema = z.object({
  variantId: idSchema,
  quantity: quantitySchema.default(1),
  personalizationId: idSchema.optional(),
  treasureId: idSchema.optional(),
});

export const updateCartItemSchema = z.object({
  itemId: idSchema,
  quantity: quantitySchema,
});

export const removeCartItemSchema = z.object({
  itemId: idSchema,
});

const shippingAddressSchema = z
  .object({
    province: z.string().trim().min(2, "استان را انتخاب کنید").max(50),
    city: z.string().trim().min(2, "شهر را انتخاب کنید").max(50),
    addressLine: z.string().trim().min(5, "نشانی را کامل وارد کنید").max(300),
    postalCode: postalCodeSchema.optional(),
    plate: z.string().trim().max(20).optional(),
    unit: z.string().trim().max(20).optional(),
  })
  .superRefine((value, ctx) => {
    if (!isIranProvince(value.province)) {
      ctx.addIssue({
        code: "custom",
        path: ["province"],
        message: "استان را از فهرست انتخاب کنید",
      });
      return;
    }
    if (!isCityInProvince(value.province, value.city)) {
      ctx.addIssue({
        code: "custom",
        path: ["city"],
        message: "شهر باید متعلق به همان استان باشد",
      });
    }
  });

export const placeOrderSchema = z.object({
  recipientName: z.string().trim().min(2, "نام گیرنده باید حداقل ۲ حرف باشد").max(80),
  recipientPhone: phoneSchema,
  shippingAddress: shippingAddressSchema,
  customerNote: z.string().trim().max(500).optional(),
  treasureId: idSchema.optional(),
});

export const transitionOrderSchema = z.object({
  orderId: idSchema,
  to: z.enum(ORDER_STATUSES),
  note: z.string().trim().max(300).optional(),
  trackingCode: z.string().trim().max(40).optional(),
  carrier: z.string().trim().max(60).optional(),
});

export const cancelOrderSchema = z.object({
  orderId: idSchema,
  reason: z.string().trim().max(300).optional(),
});

export const updateShipmentSchema = z.object({
  orderId: idSchema,
  carrier: z.string().trim().max(60).optional(),
  trackingCode: z.string().trim().max(40).optional(),
  status: z.enum(SHIPMENT_STATUSES).optional(),
  costRial: z.number().int().nonnegative().optional(),
});
