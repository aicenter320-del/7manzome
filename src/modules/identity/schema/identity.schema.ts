import { z } from "zod";

import {
  epochSchema,
  idSchema,
  nationalIdSchema,
  otpCodeSchema,
  persianNameSchema,
  phoneSchema,
} from "@/shared/lib/validators";
import { ACCESS_SECTIONS, PANEL_ACCESS_LEVELS } from "@/shared/types/enums";

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
    decision: z.enum(["verified", "rejected", "none"]),
    reason: z.string().trim().max(300).optional(),
  })
  .refine((data) => data.decision !== "rejected" || Boolean(data.reason), {
    message: "برای رد احراز هویت، ذکر دلیل الزامی است",
    path: ["reason"],
  });

export const updateAdminUserProfileSchema = updateProfileSchema.extend({
  userId: idSchema,
});

export const deleteAdminUserSchema = z.object({
  userId: idSchema,
});

export const setUserStatusSchema = z.object({
  userId: idSchema,
  status: z.enum(["active", "suspended"]),
});

export const roleSlugSchema = z
  .string()
  .min(1, "نقش را انتخاب کنید")
  .max(64, "نقش نامعتبر است")
  .regex(/^[a-z][a-zA-Z0-9_-]*$/, "نقش نامعتبر است");

export const setRoleSchema = z.object({
  userId: idSchema,
  role: roleSlugSchema,
  grant: z.boolean(),
});

export const assignUserAccessSchema = z.object({
  userId: idSchema,
  role: roleSlugSchema,
});

export const sectionGrantSchema = z.object({
  section: z.enum(ACCESS_SECTIONS),
  level: z.enum(PANEL_ACCESS_LEVELS),
});

export const staffRoleFieldsSchema = z.object({
  title: persianNameSchema,
  description: z.string().trim().max(300, "توضیح نمی‌تواند بیش از ۳۰۰ حرف باشد").optional(),
  grants: z.array(sectionGrantSchema),
});

export const createStaffRoleSchema = staffRoleFieldsSchema;

export const updateStaffRoleSchema = staffRoleFieldsSchema.extend({
  roleId: idSchema,
});

export const deleteStaffRoleSchema = z.object({
  roleId: idSchema,
});
