import Link from "next/link";

import { DataTable, TableCell, TableRow } from "@/modules/admin";
import { listProducts } from "@/modules/catalog";
import { requirePermission } from "@/server/auth/guards";
import { PRODUCT_KIND_LABELS } from "@/shared/types/enums";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";

import { CreateProductForm } from "./create-product-form";

export default async function AdminProductsPage() {
  await requirePermission("catalog:read");
  const products = await listProducts({ limit: 50 });

  return (
    <div className="grid gap-8">
      <PageHeader title="محصولات" />

      <DataTable
        columns={["عنوان", "نوع", "از قیمت"]}
        isEmpty={products.length === 0}
        emptyTitle="محصول فعالی نیست"
      >
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <Link href={`/products/${product.slug}`} className="hover:underline">
                {product.title}
              </Link>
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
