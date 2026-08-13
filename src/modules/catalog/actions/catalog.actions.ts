"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ActionError, createAction } from "@/server/actions/action-kit";
import { recordAudit } from "@/server/audit";
import { FileValidationError, saveUploadedFile } from "@/server/storage/file-storage";
import { idSchema, slugSchema } from "@/shared/lib/validators";
import { BRAND_LINES, PRODUCT_KINDS, PRODUCT_STATUSES } from "@/shared/types/enums";

import {
  insertCategory,
  insertOccasion,
  insertProduct,
  insertProductMedia,
  insertVariant,
  linkProductOccasion,
  updateProductRow,
  updateVariantRow,
} from "../repo/catalog.repo";

const productSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(2, "عنوان محصول الزامی است").max(150),
  subtitle: z.string().trim().max(200).optional(),
  description: z.string().trim().max(5_000).optional(),
  categoryId: idSchema.optional(),
  kind: z.enum(PRODUCT_KINDS),
  brandLine: z.enum(BRAND_LINES).default("standard"),
  isPersonalizable: z.boolean().default(false),
  ageMinMonths: z.number().int().min(0).max(216).optional(),
  ageMaxMonths: z.number().int().min(0).max(216).optional(),
  highlights: z.array(z.string().trim().min(2).max(120)).max(6).optional(),
  seoTitle: z.string().trim().max(120).optional(),
  seoDescription: z.string().trim().max(300).optional(),
});

export const createProduct = createAction({
  name: "catalog.createProduct",
  schema: productSchema,
  auth: "required",
  permissions: ["catalog:write"],
  handler: async ({ input, user }) => {
    const product = await insertProduct({
      slug: input.slug,
      title: input.title,
      subtitle: input.subtitle ?? null,
      description: input.description ?? null,
      categoryId: input.categoryId ?? null,
      kind: input.kind,
      brandLine: input.brandLine,
      isPersonalizable: input.isPersonalizable,
      ageMinMonths: input.ageMinMonths ?? null,
      ageMaxMonths: input.ageMaxMonths ?? null,
      highlights: input.highlights ?? null,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
    });

    await recordAudit({
      actorUserId: user.id,
      action: "product.created",
      entityType: "product",
      entityId: product.id,
      summary: `ساخت محصول «${product.title}»`,
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");

    return { productId: product.id };
  },
});

export const updateProduct = createAction({
  name: "catalog.updateProduct",
  schema: productSchema.partial().extend({ productId: idSchema }),
  auth: "required",
  permissions: ["catalog:write"],
  handler: async ({ input, user }) => {
    const { productId, slug: _slug, ...rest } = input;

    await updateProductRow(productId, {
      ...(rest.title !== undefined ? { title: rest.title } : {}),
      ...(rest.subtitle !== undefined ? { subtitle: rest.subtitle ?? null } : {}),
      ...(rest.description !== undefined ? { description: rest.description ?? null } : {}),
      ...(rest.categoryId !== undefined ? { categoryId: rest.categoryId ?? null } : {}),
      ...(rest.kind !== undefined ? { kind: rest.kind } : {}),
      ...(rest.brandLine !== undefined ? { brandLine: rest.brandLine } : {}),
      ...(rest.isPersonalizable !== undefined
        ? { isPersonalizable: rest.isPersonalizable }
        : {}),
      ...(rest.ageMinMonths !== undefined ? { ageMinMonths: rest.ageMinMonths ?? null } : {}),
      ...(rest.ageMaxMonths !== undefined ? { ageMaxMonths: rest.ageMaxMonths ?? null } : {}),
      ...(rest.highlights !== undefined ? { highlights: rest.highlights ?? null } : {}),
      ...(rest.seoTitle !== undefined ? { seoTitle: rest.seoTitle ?? null } : {}),
      ...(rest.seoDescription !== undefined
        ? { seoDescription: rest.seoDescription ?? null }
        : {}),
    });

    await recordAudit({
      actorUserId: user.id,
      action: "product.updated",
      entityType: "product",
      entityId: productId,
      summary: "به‌روزرسانی محصول",
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");

    return { ok: true };
  },
});

export const setProductStatus = createAction({
  name: "catalog.setProductStatus",
  schema: z.object({ productId: idSchema, status: z.enum(PRODUCT_STATUSES) }),
  auth: "required",
  permissions: ["catalog:write"],
  handler: async ({ input, user }) => {
    await updateProductRow(input.productId, { status: input.status });

    await recordAudit({
      actorUserId: user.id,
      action: `product.${input.status}`,
      entityType: "product",
      entityId: input.productId,
      summary: `تغییر وضعیت محصول به ${input.status}`,
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");

    return { ok: true };
  },
});

const variantSchema = z.object({
  productId: idSchema,
  sku: z
    .string()
    .trim()
    .min(2, "کد کالا الزامی است")
    .max(40)
    .regex(/^[A-Za-z0-9-]+$/, "کد کالا فقط حرف لاتین، رقم و خط تیره می‌پذیرد"),
  title: z.string().trim().min(1, "عنوان گونه الزامی است").max(100),
  weightMg: z.number().int().positive("وزن باید بزرگ‌تر از صفر باشد").max(10_000_000),
  karat: z.union([z.literal(18), z.literal(24)]),
  makingFeeBp: z.number().int().min(0).max(10_000).default(0),
  profitBp: z.number().int().min(0).max(10_000).default(0),
  premiumRial: z.number().int().min(0).default(0),
  packagingRial: z.number().int().min(0).default(0),
  personalizationRial: z.number().int().min(0).default(0),
  engravingMaxChars: z.number().int().min(0).max(60).default(0),
  stockQty: z.number().int().min(0).default(0),
});

export const createVariant = createAction({
  name: "catalog.createVariant",
  schema: variantSchema,
  auth: "required",
  permissions: ["catalog:write"],
  handler: async ({ input, user }) => {
    const variant = await insertVariant(input);

    await recordAudit({
      actorUserId: user.id,
      action: "variant.created",
      entityType: "product_variant",
      entityId: variant.id,
      summary: `افزودن گونه ${variant.sku}`,
    });

    revalidatePath("/admin/products");

    return { variantId: variant.id };
  },
});

export const updateVariant = createAction({
  name: "catalog.updateVariant",
  schema: variantSchema
    .omit({ productId: true, sku: true })
    .partial()
    .extend({ variantId: idSchema, isActive: z.boolean().optional() }),
  auth: "required",
  permissions: ["catalog:write"],
  handler: async ({ input, user }) => {
    const { variantId, ...rest } = input;

    await updateVariantRow(variantId, rest);

    await recordAudit({
      actorUserId: user.id,
      action: "variant.updated",
      entityType: "product_variant",
      entityId: variantId,
      summary: "به‌روزرسانی گونه محصول",
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");

    return { ok: true };
  },
});

export const createCategory = createAction({
  name: "catalog.createCategory",
  schema: z.object({
    slug: slugSchema,
    title: z.string().trim().min(2).max(100),
    parentId: idSchema.optional(),
    description: z.string().trim().max(500).optional(),
    sortOrder: z.number().int().min(0).default(0),
  }),
  auth: "required",
  permissions: ["catalog:write"],
  handler: async ({ input }) => {
    const category = await insertCategory({
      slug: input.slug,
      title: input.title,
      parentId: input.parentId ?? null,
      description: input.description ?? null,
      sortOrder: input.sortOrder,
    });

    revalidatePath("/admin/products");

    return { categoryId: category.id };
  },
});

export const createOccasion = createAction({
  name: "catalog.createOccasion",
  schema: z.object({
    slug: slugSchema,
    title: z.string().trim().min(2).max(100),
    description: z.string().trim().max(500).optional(),
    emoji: z.string().trim().max(8).optional(),
    ageMinMonths: z.number().int().min(0).max(216).optional(),
    ageMaxMonths: z.number().int().min(0).max(216).optional(),
    isRecurring: z.boolean().default(false),
    sortOrder: z.number().int().min(0).default(0),
  }),
  auth: "required",
  permissions: ["catalog:write"],
  handler: async ({ input }) => {
    const occasion = await insertOccasion({
      slug: input.slug,
      title: input.title,
      description: input.description ?? null,
      emoji: input.emoji ?? null,
      ageMinMonths: input.ageMinMonths ?? null,
      ageMaxMonths: input.ageMaxMonths ?? null,
      isRecurring: input.isRecurring,
      sortOrder: input.sortOrder,
    });

    revalidatePath("/occasions");

    return { occasionId: occasion.id };
  },
});

export const attachProductOccasion = createAction({
  name: "catalog.attachOccasion",
  schema: z.object({ productId: idSchema, occasionId: idSchema }),
  auth: "required",
  permissions: ["catalog:write"],
  handler: async ({ input }) => {
    await linkProductOccasion(input.productId, input.occasionId);
    revalidatePath("/admin/products");
    return { ok: true };
  },
});

export const uploadProductImage = createAction({
  name: "catalog.uploadProductImage",
  schema: z.object({
    productId: idSchema,
    file: z.instanceof(File, { message: "فایل تصویر را انتخاب کنید" }),
    alt: z.string().trim().max(150).optional(),
    setAsHero: z.boolean().default(false),
  }),
  auth: "required",
  permissions: ["catalog:write"],
  handler: async ({ input, user }) => {
    try {
      const saved = await saveUploadedFile({
        file: input.file,
        folder: "products",
        // تصاویر محصول عمومی‌اند، برخلاف تصویر کودک و رسید پرداخت.
        visibility: "public",
        uploadedByUserId: user.id,
      });

      await insertProductMedia({
        productId: input.productId,
        fileId: saved.id,
        alt: input.alt ?? null,
      });

      if (input.setAsHero) {
        await updateProductRow(input.productId, { heroFileId: saved.id });
      }

      revalidatePath("/admin/products");
      revalidatePath("/products");

      return { fileId: saved.id };
    } catch (error) {
      if (error instanceof FileValidationError) {
        throw new ActionError(error.message, { file: [error.message] });
      }
      throw error;
    }
  },
});
