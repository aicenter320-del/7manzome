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
  getProductBySlugForStaff,
  getProductForAdmin,
  getCategoryBySlug,
  getOccasionBySlug,
  getVariantWithProduct,
  listActiveInventoryVariants,
  suggestProducts,
  listRelatedProducts,
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
  detachProductOccasion,
  uploadProductImage,
  deleteProductMedia,
  setProductHero,
  reorderProductMedia,
} from "./actions/catalog.actions";

export { ProductCard } from "./ui/product-card";
export { ProductGrid } from "./ui/product-grid";
export { ProductSlider } from "./ui/product-slider";
export { ProductGallery } from "./ui/product-gallery";
export { ProductDetailHeading } from "./ui/product-detail-heading";
export { ProductStory } from "./ui/product-story";
export { ProductEditProvider } from "./ui/product-edit-context";
export { ProductEditBar } from "./ui/product-edit-bar";
export { EditableProductOccasions } from "./ui/editable-product-occasions";
export { StorefrontAddProduct } from "./ui/storefront-add-product";
export { ProductGalleryManager } from "./ui/product-gallery-manager";
export { ProductOccasionsManager } from "./ui/product-occasions-manager";
export { ProductVariantsManager } from "./ui/product-variants-manager";
export { ProductHoverImage } from "./ui/product-hover-image";
export { VariantSelector } from "./ui/variant-selector";
export { OccasionIcon, OccasionLabel } from "./ui/occasion-icon";
export { OccasionCard } from "./ui/occasion-card";
export { OccasionSlider } from "./ui/occasion-slider";
export { CategoryIcon, CategoryCircle } from "./ui/category-icon";
export { CategoryExplorer } from "./ui/category-explorer";
export { ProductFilterSheet } from "./ui/product-filter-sheet";
export { occasionIconKey } from "./domain/occasion-icon";
export { categoryIconKey } from "./domain/category-icon";
