/**
 * جایگزینی عکس محصولات موجود با فایل‌های واقعی `src/assets/images/products`.
 * دیتابیس را از نو نمی‌سازد؛ فقط بایت فایل و چک‌سام را به‌روز می‌کند.
 *
 * اجرا: npx tsx scripts/refresh-product-photos.ts
 */
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { createClient } from "@libsql/client";
import { config as loadEnv } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "@/server/db/schema";

import { renderProductPhotoBytes } from "./seed/media";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });

const databaseUrl = process.env.DATABASE_URL ?? "file:./data/haft.db";
const storageDir = resolve(process.env.STORAGE_DIR ?? "./storage");

async function main(): Promise<void> {
  const client = createClient({
    url: databaseUrl,
    ...(process.env.DATABASE_AUTH_TOKEN ? { authToken: process.env.DATABASE_AUTH_TOKEN } : {}),
  });
  const db = drizzle(client, { schema, casing: "snake_case" });

  const products = await db
    .select({ id: schema.products.id, slug: schema.products.slug })
    .from(schema.products);

  let updated = 0;

  for (const product of products) {
    const media = await db
      .select({
        fileId: schema.productMedia.fileId,
        sortOrder: schema.productMedia.sortOrder,
        storageKey: schema.mediaFiles.storageKey,
      })
      .from(schema.productMedia)
      .innerJoin(schema.mediaFiles, eq(schema.mediaFiles.id, schema.productMedia.fileId))
      .where(eq(schema.productMedia.productId, product.id))
      .orderBy(schema.productMedia.sortOrder);

    for (const item of media) {
      const bytes = await renderProductPhotoBytes(product.slug, item.sortOrder);
      writeFileSync(join(storageDir, item.storageKey), bytes);

      await db
        .update(schema.mediaFiles)
        .set({
          sizeBytes: bytes.byteLength,
          width: 900,
          height: 900,
          mimeType: "image/jpeg",
          checksum: createHash("sha256").update(bytes).digest("hex"),
        })
        .where(eq(schema.mediaFiles.id, item.fileId));

      updated += 1;
    }
  }

  console.log(`عکس ${updated} فایل محصول به‌روز شد.`);
  client.close();
}

void main();
