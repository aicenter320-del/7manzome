"use server";

import { z } from "zod";

import { createAction } from "@/server/actions/action-kit";

import { settingKeys, type SettingKey } from "../domain/settings-keys";
import { insertFaq, upsertPage } from "../repo/content.repo";
import { setSetting } from "../service/settings.service";

const updateSettingSchema = z.object({
  key: z.enum(settingKeys as [SettingKey, ...SettingKey[]]),
  value: z.unknown(),
});

export const updateSetting = createAction({
  name: "content.updateSetting",
  schema: updateSettingSchema,
  auth: "required",
  permissions: ["settings:write"],
  handler: async ({ input }) => {
    // اعتبارسنجی نهایی مقدار داخل setSetting انجام می‌شود چون به کلید بستگی دارد.
    await setSetting(input.key, input.value as never);
    return { key: input.key };
  },
});

const upsertPageSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "اسلاگ الزامی است")
    .regex(/^[a-z0-9-]+$/, "اسلاگ فقط می‌تواند حرف لاتین کوچک، رقم و خط تیره داشته باشد"),
  title: z.string().trim().min(2, "عنوان الزامی است").max(120),
  bodyMarkdown: z.string().trim().min(1, "متن صفحه الزامی است").max(50_000),
  status: z.enum(["draft", "published"]),
  seoTitle: z.string().trim().max(120).optional(),
  seoDescription: z.string().trim().max(300).optional(),
});

export const savePage = createAction({
  name: "content.savePage",
  schema: upsertPageSchema,
  auth: "required",
  permissions: ["content:write"],
  handler: async ({ input }) => {
    await upsertPage({
      slug: input.slug,
      title: input.title,
      bodyMarkdown: input.bodyMarkdown,
      status: input.status,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
    });

    return { slug: input.slug };
  },
});

const createFaqSchema = z.object({
  question: z.string().trim().min(5, "پرسش الزامی است").max(300),
  answer: z.string().trim().min(5, "پاسخ الزامی است").max(3_000),
  category: z.string().trim().max(60).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const createFaq = createAction({
  name: "content.createFaq",
  schema: createFaqSchema,
  auth: "required",
  permissions: ["content:write"],
  handler: async ({ input }) => {
    await insertFaq({
      question: input.question,
      answer: input.answer,
      category: input.category ?? null,
      sortOrder: input.sortOrder ?? 0,
    });

    return { ok: true };
  },
});
