/**
 * ماژول کاتالوگ — API عمومی.
 *
 * مسئول: محصول، گونه، دسته‌بندی، مناسبت و جست‌وجو.
 * قیمت‌گذاری مسئولیت این ماژول نیست؛ از ماژول pricing می‌آید.
 *
 * مستندات: docs/03-modules/catalog.md
 */

export type {
  Category,
  Occasion,
  ProductVariant,
  PricedVariant,
  ProductListItem,
  ProductDetail,
  ProductFilters,
  ProductMediaItem,
} from "./domain/types";

export {
  sellableVariants,
  cheapestVariant,
  weightRange,
  occasionsForAge,
  productMatchesAge,
  supportsEngraving,
  hasStock,
  stockLabel,
} from "./domain/product-filter";

export {
  listProducts,
  listCategories,
  listOccasions,
  getProductBySlug,
  getProductForAdmin,
  getCategoryBySlug,
  getOccasionBySlug,
  getVariantWithProduct,
  suggestProducts,
} from "./service/catalog.service";

export { decrementStock, incrementStock } from "./repo/catalog.repo";

export {
  createProduct,
  updateProduct,
  setProductStatus,
  createVariant,
  updateVariant,
  createCategory,
  createOccasion,
  attachProductOccasion,
  uploadProductImage,
} from "./actions/catalog.actions";

export { ProductCard } from "./ui/product-card";
export { ProductGrid } from "./ui/product-grid";
export { VariantSelector } from "./ui/variant-selector";
export { OccasionIcon, OccasionLabel } from "./ui/occasion-icon";
export { OccasionCard } from "./ui/occasion-card";
export { occasionIconKey } from "./domain/occasion-icon";
