import Link from "next/link";
import { notFound } from "next/navigation";

import { getProductForAdmin, ProductGalleryManager } from "@/modules/catalog";
import { requirePermission } from "@/server/auth/guards";
import { hasPermission } from "@/server/auth/rbac";
import { PRODUCT_KIND_LABELS, PRODUCT_STATUS_LABELS } from "@/shared/types/enums";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";

import { EditProductForm } from "./edit-product-form";

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const user = await requirePermission("catalog:read");
  const { productId } = await params;
  const product = await getProductForAdmin(productId);
  if (!product) notFound();

  const canWrite = hasPermission(user.roles, "catalog:write");

  return (
    <div className="grid gap-8">
      <PageHeader
        title={product.title}
        description={`${PRODUCT_KIND_LABELS[product.kind]} · ${PRODUCT_STATUS_LABELS[product.status]}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/products">بازگشت به فهرست</Link>
            </Button>
            {product.status === "active" ? (
              <Button asChild variant="ghost" size="sm">
                <Link href={`/products/${product.slug}`}>مشاهده در فروشگاه</Link>
              </Button>
            ) : null}
          </div>
        }
      />

      {canWrite ? <EditProductForm product={product} /> : null}

      <ProductGalleryManager
        productId={product.id}
        heroFileId={product.heroFileId}
        media={product.media}
        canWrite={canWrite}
      />
    </div>
  );
}
