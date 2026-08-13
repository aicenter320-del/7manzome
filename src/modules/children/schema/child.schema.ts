import { z } from "zod";

import { epochSchema, idSchema, latinNameSchema, persianNameSchema } from "@/shared/lib/validators";
import { ACCESS_LEVELS, CHILD_GENDERS, GUARDIAN_RELATIONS } from "@/shared/types/enums";

export const createChildSchema = z.object({
  firstName: persianNameSchema,
  lastName: persianNameSchema.optional(),
  nameEn: latinNameSchema.optional(),
  gender: z.enum(CHILD_GENDERS),
  birthDateAt: epochSchema,
  note: z.string().trim().max(500).optional(),
  relation: z.enum(GUARDIAN_RELATIONS),
});

export const updateChildSchema = z.object({
  childId: idSchema,
  firstName: persianNameSchema.optional(),
  lastName: persianNameSchema.nullable().optional(),
  nameEn: latinNameSchema.nullable().optional(),
  gender: z.enum(CHILD_GENDERS).optional(),
  birthDateAt: epochSchema.optional(),
  note: z.string().trim().max(500).nullable().optional(),
});

export const childIdSchema = z.object({ childId: idSchema });

export const addGuardianSchema = z.object({
  childId: idSchema,
  userId: idSchema,
  relation: z.enum(GUARDIAN_RELATIONS),
  accessLevel: z.enum(ACCESS_LEVELS),
});

export const addTimelineEventSchema = z.object({
  childId: idSchema,
  title: z.string().trim().min(2, "عنوان رویداد الزامی است").max(120),
  occurredAt: epochSchema,
  occasionSlug: z.string().trim().max(60).optional(),
  note: z.string().trim().max(500).optional(),
});
