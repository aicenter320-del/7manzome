import { index, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import type {
  BrandLine,
  GoldKarat,
  ProductKind,
  ProductStatus,
} from "@/shared/types/enums";

import {
  basisPoints,
  boolean,
  counter,
  createdAt,
  idRef,
  jsonColumn,
  mg,
  primaryId,
  rial,
  timestamp,
  updatedAt,
} from "../columns";
import { mediaFiles } from "./media";

/** دسته‌بندی محصول؛ می‌تواند تودرتو باشد. */
export const categories = sqliteTable(
  "categories",
  {
    id: primaryId(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    parentId: idRef("parent_id"),
    description: text("description"),
    sortOrder: counter("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("categories_slug_unique").on(table.slug),
    index("categories_parent_id_idx").on(table.parentId),
  ],
);

/**
 * مناسبت زندگی کودک.
 *
 * این محور مرور مهم‌تر از دسته‌بندی است: کاربر نمی‌داند «چه طلایی بخرد»
 * ولی می‌داند «برای تولد یک‌سالگی چیزی می‌خواهد».
 */
export const occasions = sqliteTable(
  "occasions",
  {
    id: primaryId(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    emoji: text("emoji"),

    /** بازه سنی مناسب بر حسب ماه؛ برای پیشنهاد هدیه بر اساس سن کودک. */
    ageMinMonths: counter("age_min_months"),
    ageMaxMonths: counter("age_max_months"),

    /** آیا این مناسبت سالانه تکرار می‌شود (مثل تولد و نوروز). */
    isRecurring: boolean("is_recurring").notNull().default(false),

    sortOrder: counter("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [uniqueIndex("occasions_slug_unique").on(table.slug)],
);

export const products = sqliteTable(
  "products",
  {
    id: primaryId(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    description: text("description"),

    categoryId: idRef("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),

    kind: text("kind").$type<ProductKind>().notNull().default("jewelry"),
    brandLine: text("brand_line").$type<BrandLine>().notNull().default("standard"),
    status: text("status").$type<ProductStatus>().notNull().default("draft"),

    isPersonalizable: boolean("is_personalizable").notNull().default(false),

    /** بازه سنی توصیه‌شده محصول بر حسب ماه. */
    ageMinMonths: counter("age_min_months"),
    ageMaxMonths: counter("age_max_months"),

    heroFileId: idRef("hero_file_id").references(() => mediaFiles.id, {
      onDelete: "set null",
    }),

    /** بخش «چرا این محصول؟» صفحه محصول؛ داده است، نه متن ثابت قالب. */
    highlights: jsonColumn<string[]>("highlights"),

    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),

    sortOrder: counter("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("products_slug_unique").on(table.slug),
    index("products_status_idx").on(table.status),
    index("products_kind_idx").on(table.kind),
    index("products_category_id_idx").on(table.categoryId),
  ],
);

/**
 * گونه محصول.
 *
 * موجودی و پارامترهای قیمت‌گذاری روی گونه است، نه محصول.
 * قیمت نهایی هرگز ذخیره نمی‌شود؛ در زمان اجرا از موتور قیمت‌گذاری می‌آید.
 */
export const productVariants = sqliteTable(
  "product_variants",
  {
    id: primaryId(),
    productId: idRef("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    sku: text("sku").notNull(),
    title: text("title").notNull(),

    weightMg: mg("weight_mg").notNull(),
    karat: counter("karat").$type<GoldKarat>().notNull().default(18),

    /** درصد اجرت ساخت بر مبنای ارزش طلای خام (صدم درصد). */
    makingFeeBp: basisPoints("making_fee_bp").notNull().default(0),

    /** درصد سود فروشنده (صدم درصد). */
    profitBp: basisPoints("profit_bp").notNull().default(0),

    /** حباب؛ برای محصولات سرمایه‌ای مثل سکه و شمش. */
    premiumRial: rial("premium_rial").notNull().default(0),

    packagingRial: rial("packaging_rial").notNull().default(0),

    /** هزینه ثابت شخصی‌سازی این گونه. */
    personalizationRial: rial("personalization_rial").notNull().default(0),

    /** حداکثر کاراکتر مجاز حکاکی؛ صفر یعنی حکاکی ندارد. */
    engravingMaxChars: counter("engraving_max_chars").notNull().default(0),

    stockQty: counter("stock_qty").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: counter("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("product_variants_sku_unique").on(table.sku),
    index("product_variants_product_id_idx").on(table.productId),
    index("product_variants_is_active_idx").on(table.isActive),
  ],
);

export const productMedia = sqliteTable(
  "product_media",
  {
    id: primaryId(),
    productId: idRef("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    fileId: idRef("file_id")
      .notNull()
      .references(() => mediaFiles.id, { onDelete: "cascade" }),
    alt: text("alt"),
    sortOrder: counter("sort_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (table) => [index("product_media_product_id_idx").on(table.productId)],
);

/** رابطه چند‌به‌چند محصول و مناسبت. */
export const productOccasions = sqliteTable(
  "product_occasions",
  {
    productId: idRef("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    occasionId: idRef("occasion_id")
      .notNull()
      .references(() => occasions.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.occasionId] }),
    index("product_occasions_occasion_id_idx").on(table.occasionId),
  ],
);

/** داده‌های شخصی‌سازی یک قلم سفارش. */
export const personalizations = sqliteTable(
  "personalizations",
  {
    id: primaryId(),
    childId: idRef("child_id"),

    childNameFa: text("child_name_fa"),
    childNameEn: text("child_name_en"),
    birthDateAt: timestamp("birth_date_at"),

    /** متن حکاکی؛ پاک‌سازی‌شده و با محدودیت طول گونه محصول. */
    message: text("message"),
    symbol: text("symbol"),

    photoFileId: idRef("photo_file_id").references(() => mediaFiles.id, {
      onDelete: "set null",
    }),
    previewFileId: idRef("preview_file_id").references(() => mediaFiles.id, {
      onDelete: "set null",
    }),

    /** پس از ورود سفارش به وضعیت شخصی‌سازی، تغییر ممنوع می‌شود. */
    lockedAt: timestamp("locked_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("personalizations_child_id_idx").on(table.childId)],
);
