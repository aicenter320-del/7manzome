/**
 * برش و فشرده‌سازی عکس‌های کاندید به `src/assets/images/products/<slug>.jpg`.
 * فقط هنگام آماده‌سازی دارایی اجرا می‌شود، نه در بیلد.
 */
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

import sharp from "sharp";

const CANDIDATES = join(process.cwd(), "src/assets/images/products/_candidates");
const OUT = join(process.cwd(), "src/assets/images/products");

const MAP: Record<string, string> = {
  "name-plaque": "wiki-nameplate.jpg",
  "baby-bangle": "us-bracelet.jpg",
  "quarter-bahar": "wiki-bahar-new.jpg",
  "star-pendant": "wiki-star-pendant.jpg",
  "tiny-hoops": "wiki-hoops-asq.jpg",
  "name-ring": "pexels-248077.jpg",
  "anklet-bell": "us-moon.jpg",
  "half-bahar": "wiki-bahar-old.jpg",
  "baby-bar-1g": "wiki-fine-gold.jpg",
  "moon-locket": "wiki-crescent.jpg",
};

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true });

  for (const [slug, file] of Object.entries(MAP)) {
    const source = join(CANDIDATES, file);
    if (!existsSync(source)) {
      throw new Error(`عکس کاندید ${file} برای ${slug} پیدا نشد.`);
    }

    await sharp(source)
      .rotate()
      .resize(1400, 1400, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 86 })
      .toFile(join(OUT, `${slug}.jpg`));

    console.log(`آماده شد: ${slug}.jpg`);
  }
}

void main();
