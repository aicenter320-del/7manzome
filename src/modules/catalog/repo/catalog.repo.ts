import "server-only";

import { and, asc, count, desc, eq, inArray, like, or } from "drizzle-orm";

import { db } from "@/server/db";
import {
  categories,
  occasions,
  productMedia,
  productOccasions,
  productVariants,
  products,
} from "@/server/db/schema";
import type {
  CategoryRow,
  OccasionRow,
  ProductRow,
  ProductVariantRow,
} from "@/server/db/types";
import type { BrandLine, GoldKarat, ProductKind, ProductStatus } from "@/shared/types/enums";

// ------------------------------------------------------------------
// دسته‌بندی و مناسبت
// ------------------------------------------------------------------

export async function findCategories(activeOnly = true): Promise<CategoryRow[]> {
  const query = db.select().from(categories);

  return (activeOnly ? query.where(eq(categories.isActive, true)) : query).orderBy(
    asc(categories.sortOrder),
  );
}

export async function findCategoryBySlug(slug: string): Promise<CategoryRow | null> {
  const rows = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function findOccasions(activeOnly = true): Promise<OccasionRow[]> {
  const query = db.select().from(occasions);

  return (activeOnly ? query.where(eq(occasions.isActive, true)) : query).orderBy(
    asc(occasions.sortOrder),
  );
}

export async function findOccasionBySlug(slug: string): Promise<OccasionRow | null> {
  const rows = await db.select().from(occasions).where(eq(occasions.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function findOccasionsForProduct(productId: string): Promise<OccasionRow[]> {
  return db
    .select({
      id: occasions.id,
      slug: occasions.slug,
      title: occasions.title,
      description: occasions.description,
      emoji: occasions.emoji,
      ageMinMonths: occasions.ageMinMonths,
      ageMaxMonths: occasions.ageMaxMonths,
      isRecurring: occasions.isRecurring,
      sortOrder: occasions.sortOrder,
      isActive: occasions.isActive,
      createdAt: occasions.createdAt,
      updatedAt: occasions.updatedAt,
    })
    .from(productOccasions)
    .innerJoin(occasions, eq(occasions.id, productOccasions.occasionId))
    .where(eq(productOccasions.productId, productId))
    .orderBy(asc(occasions.sortOrder));
}

// ------------------------------------------------------------------
// محصول
// ------------------------------------------------------------------

export interface ProductQueryFilters {
  categoryId?: string;
  occasionId?: string;
  kind?: ProductKind;
  brandLine?: BrandLine;
  search?: string;
  status?: ProductStatus;
  limit?: number;
  offset?: number;
  sort?: "newest" | "weight_asc";
}

export async function findProducts(filters: ProductQueryFilters = {}): Promise<ProductRow[]> {
  const conditions = [eq(products.status, filters.status ?? "active")];

  if (filters.categoryId) conditions.push(eq(products.categoryId, filters.categoryId));
  if (filters.kind) conditions.push(eq(products.kind, filters.kind));
  if (filters.brandLine) conditions.push(eq(products.brandLine, filters.brandLine));

  if (filters.search) {
    const pattern = `%${filters.search}%`;
    const searchClause = or(
      like(products.title, pattern),
      like(products.subtitle, pattern),
      like(products.description, pattern),
    );
    if (searchClause) conditions.push(searchClause);
  }

  // فیلتر مناسبت با جدول واسط انجام می‌شود.
  if (filters.occasionId) {
    const matched = await db
      .select({ productId: productOccasions.productId })
      .from(productOccasions)
      .where(eq(productOccasions.occasionId, filters.occasionId));

    const ids = matched.map((row) => row.productId);
    if (ids.length === 0) return [];

    conditions.push(inArray(products.id, ids));
  }

  return db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(asc(products.sortOrder), desc(products.createdAt))
    .limit(filters.limit ?? 48)
    .offset(filters.offset ?? 0);
}

export async function findProductBySlug(slug: string): Promise<ProductRow | null> {
  const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function findProductById(productId: string): Promise<ProductRow | null> {
  const rows = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  return rows[0] ?? null;
}

export async function countProducts(status: ProductStatus = "active"): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(products)
    .where(eq(products.status, status));

  return rows[0]?.value ?? 0;
}

// ------------------------------------------------------------------
// گونه
// ------------------------------------------------------------------

export async function findVariantsForProduct(
  productId: string,
  activeOnly = true,
): Promise<ProductVariantRow[]> {
  const conditions = [eq(productVariants.productId, productId)];
  if (activeOnly) conditions.push(eq(productVariants.isActive, true));

  return db
    .select()
    .from(productVariants)
    .where(and(...conditions))
    .orderBy(asc(productVariants.sortOrder), asc(productVariants.weightMg));
}

export async function findVariantsForProducts(
  productIds: readonly string[],
): Promise<ProductVariantRow[]> {
  if (productIds.length === 0) return [];

  return db
    .select()
    .from(productVariants)
    .where(
      and(
        inArray(productVariants.productId, [...productIds]),
        eq(productVariants.isActive, true),
      ),
    )
    .orderBy(asc(productVariants.weightMg));
}

export async function findVariantById(variantId: string): Promise<ProductVariantRow | null> {
  const rows = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.id, variantId))
    .limit(1);

  return rows[0] ?? null;
}

/** کاهش موجودی گونه؛ فقط از سرویس سفارش و داخل تراکنش صدا زده می‌شود. */
export async function decrementStock(
  variantId: string,
  quantity: number,
): Promise<void> {
  const variant = await findVariantById(variantId);
  if (!variant) throw new Error("گونه محصول پیدا نشد.");

  await db
    .update(productVariants)
    .set({ stockQty: Math.max(0, variant.stockQty - quantity) })
    .where(eq(productVariants.id, variantId));
}

export async function incrementStock(
  variantId: string,
  quantity: number,
): Promise<void> {
  const variant = await findVariantById(variantId);
  if (!variant) return;

  await db
    .update(productVariants)
    .set({ stockQty: variant.stockQty + quantity })
    .where(eq(productVariants.id, variantId));
}

// ------------------------------------------------------------------
// تصاویر
// ------------------------------------------------------------------

export async function findMediaForProduct(
  productId: string,
): Promise<Array<{ id: string; fileId: string; alt: string | null }>> {
  return db
    .select({ id: productMedia.id, fileId: productMedia.fileId, alt: productMedia.alt })
    .from(productMedia)
    .where(eq(productMedia.productId, productId))
    .orderBy(asc(productMedia.sortOrder));
}

// ------------------------------------------------------------------
// نوشتن (پنل ادمین)
// ------------------------------------------------------------------

export async function insertProduct(input: {
  slug: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  categoryId?: string | null;
  kind: ProductKind;
  brandLine: BrandLine;
  isPersonalizable: boolean;
  ageMinMonths?: number | null;
  ageMaxMonths?: number | null;
  highlights?: string[] | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}): Promise<ProductRow> {
  const [row] = await db
    .insert(products)
    .values({
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
    })
    .returning();

  if (!row) throw new Error("ثبت محصول شکست خورد.");

  return row;
}

export async function updateProductRow(
  productId: string,
  input: Partial<{
    title: string;
    subtitle: string | null;
    description: string | null;
    categoryId: string | null;
    kind: ProductKind;
    brandLine: BrandLine;
    status: ProductStatus;
    isPersonalizable: boolean;
    ageMinMonths: number | null;
    ageMaxMonths: number | null;
    highlights: string[] | null;
    heroFileId: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
  }>,
): Promise<void> {
  await db.update(products).set(input).where(eq(products.id, productId));
}

export async function insertVariant(input: {
  productId: string;
  sku: string;
  title: string;
  weightMg: number;
  karat: 18 | 24;
  makingFeeBp: number;
  profitBp: number;
  premiumRial: number;
  packagingRial: number;
  personalizationRial: number;
  engravingMaxChars: number;
  stockQty: number;
}): Promise<ProductVariantRow> {
  const [row] = await db.insert(productVariants).values(input).returning();

  if (!row) throw new Error("ثبت گونه محصول شکست خورد.");

  return row;
}

export async function updateVariantRow(
  variantId: string,
  input: Partial<{
    title: string;
    weightMg: number;
    karat: 18 | 24;
    makingFeeBp: number;
    profitBp: number;
    premiumRial: number;
    packagingRial: number;
    personalizationRial: number;
    engravingMaxChars: number;
    stockQty: number;
    isActive: boolean;
  }>,
): Promise<void> {
  await db.update(productVariants).set(input).where(eq(productVariants.id, variantId));
}

export async function insertCategory(input: {
  slug: string;
  title: string;
  parentId?: string | null;
  description?: string | null;
  sortOrder?: number;
}): Promise<CategoryRow> {
  const [row] = await db
    .insert(categories)
    .values({
      slug: input.slug,
      title: input.title,
      parentId: input.parentId ?? null,
      description: input.description ?? null,
      sortOrder: input.sortOrder ?? 0,
    })
    .returning();

  if (!row) throw new Error("ثبت دسته‌بندی شکست خورد.");

  return row;
}

export async function insertOccasion(input: {
  slug: string;
  title: string;
  description?: string | null;
  emoji?: string | null;
  ageMinMonths?: number | null;
  ageMaxMonths?: number | null;
  isRecurring?: boolean;
  sortOrder?: number;
}): Promise<OccasionRow> {
  const [row] = await db
    .insert(occasions)
    .values({
      slug: input.slug,
      title: input.title,
      description: input.description ?? null,
      emoji: input.emoji ?? null,
      ageMinMonths: input.ageMinMonths ?? null,
      ageMaxMonths: input.ageMaxMonths ?? null,
      isRecurring: input.isRecurring ?? false,
      sortOrder: input.sortOrder ?? 0,
    })
    .returning();

  if (!row) throw new Error("ثبت مناسبت شکست خورد.");

  return row;
}

export async function linkProductOccasion(
  productId: string,
  occasionId: string,
): Promise<void> {
  await db.insert(productOccasions).values({ productId, occasionId }).onConflictDoNothing();
}

export async function insertProductMedia(input: {
  productId: string;
  fileId: string;
  alt?: string | null;
  sortOrder?: number;
}): Promise<void> {
  await db.insert(productMedia).values({
    productId: input.productId,
    fileId: input.fileId,
    alt: input.alt ?? null,
    sortOrder: input.sortOrder ?? 0,
  });
}

export interface InventoryVariantRow {
  productId: string;
  productTitle: string;
  kind: ProductKind;
  sku: string;
  stockQty: number;
  weightMg: number;
  karat: GoldKarat;
  makingFeeBp: number;
  profitBp: number;
  premiumRial: number;
  packagingRial: number;
  personalizationRial: number;
}

export async function findActiveInventoryVariants(): Promise<InventoryVariantRow[]> {
  return db
    .select({
      productId: products.id,
      productTitle: products.title,
      kind: products.kind,
      sku: productVariants.sku,
      stockQty: productVariants.stockQty,
      weightMg: productVariants.weightMg,
      karat: productVariants.karat,
      makingFeeBp: productVariants.makingFeeBp,
      profitBp: productVariants.profitBp,
      premiumRial: productVariants.premiumRial,
      packagingRial: productVariants.packagingRial,
      personalizationRial: productVariants.personalizationRial,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(and(eq(products.status, "active"), eq(productVariants.isActive, true)));
}
