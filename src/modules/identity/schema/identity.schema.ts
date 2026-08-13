import { z } from "zod";

import {
  epochSchema,
  idSchema,
  nationalIdSchema,
  otpCodeSchema,
  persianNameSchema,
  phoneSchema,
} from "@/shared/lib/validators";
import { USER_ROLES } from "@/shared/types/enums";

export const requestOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  code: otpCodeSchema,
  /** مسیر بازگشت پس از ورود؛ فقط مسیر داخلی مجاز است. */
  returnTo: z
    .string()
    .startsWith("/", "مسیر بازگشت نامعتبر است")
    .max(200)
    .optional(),
});

export const updateProfileSchema = z.object({
  firstName: persianNameSchema,
  lastName: persianNameSchema,
  email: z.string().trim().email("ایمیل معتبر نیست").optional().or(z.literal("")),
});

export const submitKycSchema = z.object({
  firstName: persianNameSchema,
  lastName: persianNameSchema,
  nationalId: nationalIdSchema,
  birthDateAt: epochSchema,
});

export const reviewKycSchema = z
  .object({
    userId: idSchema,
    decision: z.enum(["verified", "rejected"]),
    reason: z.string().trim().max(300).optional(),
  })
  .refine((data) => data.decision !== "rejected" || Boolean(data.reason), {
    message: "برای رد احراز هویت، ذکر دلیل الزامی است",
    path: ["reason"],
  });

export const setUserStatusSchema = z.object({
  userId: idSchema,
  status: z.enum(["active", "suspended"]),
});

export const setRoleSchema = z.object({
  userId: idSchema,
  role: z.enum(USER_ROLES),
  grant: z.boolean(),
});
