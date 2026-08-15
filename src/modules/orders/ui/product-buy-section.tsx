"use client";

import { type ReactNode, useState } from "react";

import type { ProductDetail } from "@/modules/catalog/domain/types";
import { EditableProductVariants } from "@/modules/catalog/ui/editable-product-variants";
import { ProductGallery } from "@/modules/catalog/ui/product-gallery";
import { useProductEdit } from "@/modules/catalog/ui/product-edit-context";

import { AddToCartPanel, firstSellableVariantId } from "./add-to-cart-panel";
import { EngravingBlock } from "./engraving-block";

/** دو ستون خرید: گالری و حکاکی چپ، قیمت و سبد راست. */
export function ProductBuySection({
  product,
  heading,
}: {
  product: ProductDetail;
  heading: ReactNode;
}) {
  const { editing } = useProductEdit();
  const [selectedId, setSelectedId] = useState(() => firstSellableVariantId(product.variants));
  const [nameFa, setNameFa] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [message, setMessage] = useState("");
  const selected = product.variants.find((item) => item.id === selectedId) ?? product.variants[0];
  const showEngraving = product.isPersonalizable && !editing;

  return (
    <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="grid gap-6 lg:sticky lg:top-[calc(var(--site-header-height)+0.75rem)]">
        <ProductGallery
          title={product.title}
          heroFileId={product.heroFileId}
          media={product.media}
          productId={product.id}
        />
        {showEngraving ? (
          <EngravingBlock
            nameFa={nameFa}
            nameEn={nameEn}
            message={message}
            maxChars={selected?.engravingMaxChars ?? 0}
            onNameFaChange={setNameFa}
            onNameEnChange={setNameEn}
            onMessageChange={setMessage}
          />
        ) : null}
      </div>

      <div className="grid gap-8">
        {heading}
        {editing ? (
          <EditableProductVariants productId={product.id} variants={product.variants} />
        ) : (
          <AddToCartPanel
            variants={product.variants}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        )}
      </div>
    </div>
  );
}
