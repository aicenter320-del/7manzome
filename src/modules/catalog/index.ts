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
  MAX_PRODUCT_IMAGES,
  hoverFileId,
  orderedGallery,
} from "./domain/product-gallery";

export {
  listProducts,
  listCategories,
  listOccasions,
  getProductBySlug,
  getProductForAdmin,
  getCategoryBySlug,
  getOccasionBySlug,
  getVariantWithProduct,
  listActiveInventoryVariants,
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
  deleteProductMedia,
  setProductHero,
  reorderProductMedia,
} from "./actions/catalog.actions";

export { ProductCard } from "./ui/product-card";
export { ProductGrid } from "./ui/product-grid";
export { ProductGallery } from "./ui/product-gallery";
export { ProductGalleryManager } from "./ui/product-gallery-manager";
export { ProductHoverImage } from "./ui/product-hover-image";
export { VariantSelector } from "./ui/variant-selector";
export { OccasionIcon, OccasionLabel } from "./ui/occasion-icon";
export { OccasionCard } from "./ui/occasion-card";
export { OccasionSlider } from "./ui/occasion-slider";
export { occasionIconKey } from "./domain/occasion-icon";
