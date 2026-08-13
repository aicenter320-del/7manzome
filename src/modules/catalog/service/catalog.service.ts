import "server-only";

import { priceVariants, type PricingParams } from "@/modules/pricing";
import type { OccasionRow, ProductRow, ProductVariantRow } from "@/server/db/types";

import { cheapestVariant, productMatchesAge, weightRange } from "../domain/product-filter";
import type {
  Category,
  Occasion,
  PricedVariant,
  ProductDetail,
  ProductFilters,
  ProductListItem,
  ProductVariant,
} from "../domain/types";
import {
  findCategories,
  findCategoryBySlug,
  findMediaForProduct,
  findOccasionBySlug,
  findOccasions,
  findOccasionsForProduct,
  findProductById,
  findProductBySlug,
  findProducts,
  findVariantById,
  findVariantsForProduct,
  findVariantsForProducts,
} from "../repo/catalog.repo";

function toVariant(row: ProductVariantRow): ProductVariant {
  return {
    id: row.id,
    productId: row.productId,
    sku: row.sku,
    title: row.title,
    weightMg: row.weightMg,
    karat: row.karat,
    makingFeeBp: row.makingFeeBp,
    profitBp: row.profitBp,
    premiumRial: row.premiumRial,
    packagingRial: row.packagingRial,
    personalizationRial: row.personalizationRial,
    engravingMaxChars: row.engravingMaxChars,
    stockQty: row.stockQty,
    isActive: row.isActive,
  };
}

function toOccasion(row: OccasionRow): Occasion {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    emoji: row.emoji,
    ageMinMonths: row.ageMinMonths,
    ageMaxMonths: row.ageMaxMonths,
    isRecurring: row.isRecurring,
    sortOrder: row.sortOrder,
  };
}

/** پارامترهای قیمت‌گذاری یک گونه؛ نوع محصول تعیین‌کننده فرمول است. */
function pricingParams(product: ProductRow, variant: ProductVariant): PricingParams {
  return {
    kind: product.kind,
    weightMg: variant.weightMg,
    karat: variant.karat,
    makingFeeBp: variant.makingFeeBp,
    profitBp: variant.profitBp,
    premiumRial: variant.premiumRial,
    packagingRial: variant.packagingRial,
    personalizationRial: variant.personalizationRial,
  };
}

export async function listCategories(): Promise<Category[]> {
  const rows = await findCategories();

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    parentId: row.parentId,
    description: row.description,
    sortOrder: row.sortOrder,
  }));
}

export async function listOccasions(): Promise<Occasion[]> {
  const rows = await findOccasions();
  return rows.map(toOccasion);
}

export async function getOccasionBySlug(slug: string): Promise<Occasion | null> {
  const row = await findOccasionBySlug(slug);
  return row ? toOccasion(row) : null;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const row = await findCategoryBySlug(slug);
  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    parentId: row.parentId,
    description: row.description,
    sortOrder: row.sortOrder,
  };
}

/**
 * فهرست محصولات با قیمت زنده.
 *
 * قیمت هرگز ذخیره نمی‌شود؛ همیشه از موتور قیمت‌گذاری می‌آید. قیمت‌گذاری
 * دسته‌ای انجام می‌شود تا برای هر گونه یک بار به دیتابیس مراجعه نکنیم.
 */
export async function listProducts(filters: ProductFilters = {}): Promise<ProductListItem[]> {
  const [category, occasion] = await Promise.all([
    filters.categorySlug ? findCategoryBySlug(filters.categorySlug) : null,
    filters.occasionSlug ? findOccasionBySlug(filters.occasionSlug) : null,
  ]);

  // اسلاگ ناموجود نباید همه محصولات را برگرداند.
  if (filters.categorySlug && !category) return [];
  if (filters.occasionSlug && !occasion) return [];

  const productRows = await findProducts({
    ...(category ? { categoryId: category.id } : {}),
    ...(occasion ? { occasionId: occasion.id } : {}),
    ...(filters.kind ? { kind: filters.kind } : {}),
    ...(filters.brandLine ? { brandLine: filters.brandLine } : {}),
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.limit ? { limit: filters.limit } : {}),
    ...(filters.offset ? { offset: filters.offset } : {}),
  });

  const ageFiltered =
    filters.ageMonths === undefined
      ? productRows
      : productRows.filter((row) => productMatchesAge(row, filters.ageMonths!));

  if (ageFiltered.length === 0) return [];

  const variantRows = await findVariantsForProducts(ageFiltered.map((row) => row.id));
  const productById = new Map(ageFiltered.map((row) => [row.id, row]));

  const pricingInputs = variantRows.flatMap((row) => {
    const product = productById.get(row.productId);
    if (!product) return [];

    return [{ key: row.id, params: pricingParams(product, toVariant(row)) }];
  });

  // اگر قیمت طلا ثبت نشده باشد، موتور قیمت خطا می‌دهد؛ در فهرست محصولات
  // به‌جای شکست کل صفحه، قیمت را خالی نشان می‌دهیم.
  const prices = await priceVariants(pricingInputs).catch(() => new Map());

  const items: ProductListItem[] = [];

  for (const product of ageFiltered) {
    const variants: PricedVariant[] = variantRows
      .filter((row) => row.productId === product.id)
      .map((row) => ({ ...toVariant(row), price: prices.get(row.id) ?? null }));

    const cheapest = cheapestVariant(variants);
    const range = weightRange(variants);

    items.push({
      id: product.id,
      slug: product.slug,
      title: product.title,
      subtitle: product.subtitle,
      kind: product.kind,
      brandLine: product.brandLine,
      isPersonalizable: product.isPersonalizable,
      heroFileId: product.heroFileId,
      fromPriceRial: cheapest?.price?.unitPriceRial ?? null,
      minWeightMg: range?.minMg ?? null,
      maxWeightMg: range?.maxMg ?? null,
    });
  }

  if (filters.sort === "price_asc") {
    items.sort((a, b) => (a.fromPriceRial ?? Infinity) - (b.fromPriceRial ?? Infinity));
  } else if (filters.sort === "price_desc") {
    items.sort((a, b) => (b.fromPriceRial ?? 0) - (a.fromPriceRial ?? 0));
  } else if (filters.sort === "weight_asc") {
    items.sort((a, b) => (a.minWeightMg ?? Infinity) - (b.minWeightMg ?? Infinity));
  }

  return filters.maxPriceRial
    ? items.filter(
        (item) => item.fromPriceRial !== null && item.fromPriceRial <= filters.maxPriceRial!,
      )
    : items;
}

async function buildDetail(product: ProductRow): Promise<ProductDetail> {
  const [variantRows, media, occasionRows] = await Promise.all([
    findVariantsForProduct(product.id),
    findMediaForProduct(product.id),
    findOccasionsForProduct(product.id),
  ]);

  const variants = variantRows.map(toVariant);

  const prices = await priceVariants(
    variants.map((variant) => ({ key: variant.id, params: pricingParams(product, variant) })),
  ).catch(() => new Map());

  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    subtitle: product.subtitle,
    description: product.description,
    kind: product.kind,
    brandLine: product.brandLine,
    status: product.status,
    isPersonalizable: product.isPersonalizable,
    ageMinMonths: product.ageMinMonths,
    ageMaxMonths: product.ageMaxMonths,
    heroFileId: product.heroFileId,
    highlights: product.highlights ?? [],
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    categoryId: product.categoryId,
    variants: variants.map((variant) => ({
      ...variant,
      price: prices.get(variant.id) ?? null,
    })),
    media,
    occasions: occasionRows.map(toOccasion),
  };
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const product = await findProductBySlug(slug);
  if (!product || product.status !== "active") return null;

  return buildDetail(product);
}

/** جزئیات محصول بدون فیلتر وضعیت؛ برای پنل ادمین. */
export async function getProductForAdmin(productId: string): Promise<ProductDetail | null> {
  const product = await findProductById(productId);
  return product ? buildDetail(product) : null;
}

export async function getVariantWithProduct(variantId: string): Promise<{
  product: ProductRow;
  variant: ProductVariant;
  pricingParams: PricingParams;
} | null> {
  const variantRow = await findVariantById(variantId);
  if (!variantRow) return null;

  const product = await findProductById(variantRow.productId);
  if (!product) return null;

  const variant = toVariant(variantRow);

  return { product, variant, pricingParams: pricingParams(product, variant) };
}

/** محصولات پیشنهادی برای یک مناسبت و سن مشخص. */
export async function suggestProducts(input: {
  occasionSlug?: string;
  ageMonths?: number;
  limit?: number;
}): Promise<ProductListItem[]> {
  return listProducts({
    ...(input.occasionSlug ? { occasionSlug: input.occasionSlug } : {}),
    ...(input.ageMonths !== undefined ? { ageMonths: input.ageMonths } : {}),
    limit: input.limit ?? 8,
  });
}
