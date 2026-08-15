import Link from "next/link";

import { DataTable, TableCell, TableRow } from "@/modules/admin";
import { listProducts } from "@/modules/catalog";
import { requirePermission } from "@/server/auth/guards";
import { toPersianDigits } from "@/shared/lib/persian";
import {
  PRODUCT_KIND_LABELS,
  PRODUCT_STATUS_LABELS,
  type ProductStatus,
} from "@/shared/types/enums";
import { Badge } from "@/shared/ui/badge";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";

import { CreateProductForm } from "./create-product-form";

function statusBadge(status: ProductStatus) {
  if (status === "active") return "success" as const;
  if (status === "archived") return "warning" as const;
  return "muted" as const;
}

export default async function AdminProductsPage() {
  await requirePermission("catalog:read");
  const products = await listProducts({ status: "any", limit: 50 });

  return (
    <div className="grid gap-8">
      <PageHeader
        title="محصولات"
        description="عنوان، وضعیت، ترتیب نمایش و گالری هر محصول را از صفحهٔ ویرایش تنظیم کنید."
      />

      <DataTable
        columns={["تصویر", "عنوان", "وضعیت", "ترتیب", "نوع", "از قیمت"]}
        isEmpty={products.length === 0}
        emptyTitle="محصولی ثبت نشده"
      >
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <Link href={`/admin/products/${product.id}`} className="block">
                <span className="relative flex size-14 overflow-hidden rounded-md bg-muted">
                  {product.heroFileId ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/files/${product.heroFileId}`}
                      alt=""
                      className="size-full object-contain p-1"
                    />
                  ) : (
                    <span className="m-auto text-[10px] text-muted-foreground">بدون تصویر</span>
                  )}
                </span>
              </Link>
            </TableCell>
            <TableCell>
              <Link href={`/admin/products/${product.id}`} className="font-medium hover:underline">
                {product.title}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant={statusBadge(product.status)}>
                {PRODUCT_STATUS_LABELS[product.status]}
              </Badge>
            </TableCell>
            <TableCell className="ltr-nums" dir="ltr">
              {toPersianDigits(product.sortOrder)}
            </TableCell>
            <TableCell>{PRODUCT_KIND_LABELS[product.kind]}</TableCell>
            <TableCell>
              {product.fromPriceRial === null ? "—" : <Money rial={product.fromPriceRial} />}
            </TableCell>
          </TableRow>
        ))}
      </DataTable>

      <CreateProductForm />
    </div>
  );
}
