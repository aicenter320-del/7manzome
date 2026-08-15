import type { PriceBreakdown } from "@/modules/pricing/domain/types";
import type {
  BrandLine,
  GoldKarat,
  ProductKind,
  ProductStatus,
} from "@/shared/types/enums";

export interface Category {
  id: string;
  slug: string;
  title: string;
  parentId: string | null;
  description: string | null;
  sortOrder: number;
}

export interface Occasion {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  emoji: string | null;
  ageMinMonths: number | null;
  ageMaxMonths: number | null;
  isRecurring: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  title: string;
  weightMg: number;
  karat: GoldKarat;
  makingFeeBp: number;
  profitBp: number;
  premiumRial: number;
  packagingRial: number;
  personalizationRial: number;
  engravingMaxChars: number;
  stockQty: number;
  isActive: boolean;
}

/** گونه به‌همراه قیمت محاسبه‌شده لحظه‌ای. */
export interface PricedVariant extends ProductVariant {
  price: PriceBreakdown | null;
}

export interface ProductMediaItem {
  id: string;
  fileId: string;
  alt: string | null;
  sortOrder: number;
}

export interface ProductListItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  kind: ProductKind;
  brandLine: BrandLine;
  status: ProductStatus;
  isPersonalizable: boolean;
  heroFileId: string | null;
  /** تصویر دوم گالری؛ برای تعویض هنگام بردن موس روی کارت. */
  hoverFileId: string | null;
  sortOrder: number;
  /** ارزان‌ترین گونه فعال؛ مبنای نمایش «از ... تومان». */
  fromPriceRial: number | null;
  minWeightMg: number | null;
  maxWeightMg: number | null;
}

export interface ProductDetail {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  kind: ProductKind;
  brandLine: BrandLine;
  status: ProductStatus;
  isPersonalizable: boolean;
  ageMinMonths: number | null;
  ageMaxMonths: number | null;
  heroFileId: string | null;
  highlights: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  categoryId: string | null;
  sortOrder: number;
  variants: PricedVariant[];
  media: ProductMediaItem[];
  occasions: Occasion[];
}

export interface ProductFilters {
  categorySlug?: string;
  occasionSlug?: string;
  kind?: ProductKind;
  brandLine?: BrandLine;
  /** پیش‌فرض ویترین `active` است؛ ادمین با `any` همه وضعیت‌ها را می‌بیند. */
  status?: ProductStatus | "any";
  search?: string;
  /** سن کودک به ماه؛ برای پیشنهاد محصول مناسب. */
  ageMonths?: number;
  maxPriceRial?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "weight_asc";
  limit?: number;
  offset?: number;
}
