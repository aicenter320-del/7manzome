import { z } from "zod";

import { cardNumberSchema, epochSchema, idSchema, ibanSchema } from "@/shared/lib/validators";
import { toEnglishDigits } from "@/shared/lib/persian";

export const submitReceiptSchema = z.object({
  paymentId: idSchema,

  /** شماره پیگیری تراکنش بانکی؛ در کل سیستم یکتاست. */
  referenceNumber: z
    .string()
    .trim()
    .transform((value) => toEnglishDigits(value).replace(/\s/g, ""))
    .refine((value) => value.length >= 4 && value.length <= 40, {
      message: "شماره پیگیری را درست وارد کنید",
    })
    .refine((value) => /^[A-Za-z0-9-]+$/.test(value), {
      message: "شماره پیگیری فقط می‌تواند رقم و حرف لاتین داشته باشد",
    }),

  paidAmountRial: z
    .number()
    .int("مبلغ باید عدد صحیح ریالی باشد")
    .positive("مبلغ واریزی را وارد کنید"),

  payerName: z.string().trim().min(3, "نام واریزکننده الزامی است").max(100),

  payerCardLast4: z
    .string()
    .trim()
    .transform((value) => toEnglishDigits(value).replace(/\D/g, ""))
    .refine((value) => value === "" || value.length === 4, {
      message: "چهار رقم آخر کارت را وارد کنید",
    })
    .optional(),

  bankName: z.string().trim().max(60).optional(),
  paidAt: epochSchema,
  note: z.string().trim().max(300).optional(),
  receiptFileId: idSchema.optional(),
});

export const reviewPaymentSchema = z
  .object({
    paymentId: idSchema,
    decision: z.enum(["confirmed", "rejected"]),
    reason: z.string().trim().max(300).optional(),
  })
  .refine((data) => data.decision !== "rejected" || Boolean(data.reason), {
    message: "برای رد پرداخت، ذکر دلیل الزامی است",
    path: ["reason"],
  });

export const createBankAccountSchema = z.object({
  title: z.string().trim().min(2, "عنوان حساب الزامی است").max(80),
  bankName: z.string().trim().min(2, "نام بانک الزامی است").max(60),
  cardNumber: cardNumberSchema,
  iban: ibanSchema.optional(),
  accountHolder: z.string().trim().min(3, "نام صاحب حساب الزامی است").max(100),
  sortOrder: z.number().int().min(0).default(0),
});

export const toggleBankAccountSchema = z.object({
  bankAccountId: idSchema,
  isActive: z.boolean(),
});
