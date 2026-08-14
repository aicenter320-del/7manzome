import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import sharp from "sharp";

import * as schema from "@/server/db/schema";
import type { FileVisibility } from "@/shared/types/enums";

import type { SeedContext } from "./types";

const HERO_PATH = join(process.cwd(), "src/assets/images/hero-gold-products.jpg");
/** عکس واقعی هر محصول: `src/assets/images/products/<slug>.jpg` (Wikimedia / Unsplash / Pexels). */
const PRODUCT_PHOTO_DIR = join(process.cwd(), "src/assets/images/products");
const PRODUCT_CROP_POSITIONS = ["centre", "north", "east"] as const;

const AVATAR_PALETTES: Array<[string, string]> = [
  ["#C9A227", "#8A6A12"],
  ["#E8C56A", "#B8860B"],
  ["#D4A574", "#8B5A2B"],
  ["#F0D78C", "#C4A35A"],
  ["#C4B08A", "#7A6540"],
  ["#E6D5A8", "#A67C2A"],
  ["#B8956C", "#6B4F2A"],
  ["#F5E6C4", "#C9A227"],
  ["#DDB87A", "#8C6B2F"],
  ["#EAD7A0", "#9A7B3C"],
];

export interface SavedSeedFile {
  id: string;
  storageKey: string;
}

async function saveJpeg(
  ctx: SeedContext,
  input: {
    folder: "products" | "children" | "receipts";
    bytes: Buffer;
    originalName: string;
    visibility: FileVisibility;
    width: number;
    height: number;
    uploadedByUserId?: string;
  },
): Promise<SavedSeedFile> {
  const fileName = `${randomBytes(12).toString("hex")}.jpg`;
  const storageKey = `${input.folder}/${fileName}`;
  const absolutePath = resolve(join(ctx.storageDir, storageKey));

  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, input.bytes);

  const [row] = await ctx.db
    .insert(schema.mediaFiles)
    .values({
      storageKey,
      originalName: input.originalName,
      mimeType: "image/jpeg",
      sizeBytes: input.bytes.byteLength,
      width: input.width,
      height: input.height,
      visibility: input.visibility,
      checksum: createHash("sha256").update(input.bytes).digest("hex"),
      uploadedByUserId: input.uploadedByUserId ?? ctx.adminId,
      createdAt: ctx.now,
    })
    .returning({ id: schema.mediaFiles.id, storageKey: schema.mediaFiles.storageKey });

  if (!row) throw new Error(`ثبت فایل ${input.originalName} شکست خورد.`);

  return row;
}

async function goldFallback(size: number, hueShift: number): Promise<Buffer> {
  const overlay = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#F5E6C4"/>
          <stop offset="50%" stop-color="#C9A227"/>
          <stop offset="100%" stop-color="#8A6A12"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#g)"/>
      <circle cx="${size * 0.5}" cy="${size * 0.48}" r="${size * 0.22}" fill="none" stroke="#fff8e7" stroke-width="8" opacity="0.55"/>
      <rect x="${size * 0.35}" y="${size * 0.62}" width="${size * 0.3}" height="${size * 0.08}" rx="8" fill="#fff8e7" opacity="0.35"/>
    </svg>`,
  );

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: { r: 201 + (hueShift % 20), g: 162, b: 39 },
    },
  })
    .composite([{ input: overlay, blend: "over" }])
    .jpeg({ quality: 82 })
    .toBuffer();
}

/** تصویر محصول از عکس واقعی همان slug؛ در نبود فایل، برش هیرو یا گرادیان. */
export async function saveProductPhoto(
  ctx: SeedContext,
  slug: string,
  index: number,
): Promise<SavedSeedFile> {
  const size = 900;
  const bytes = await renderProductPhotoBytes(slug, index, size);

  return saveJpeg(ctx, {
    folder: "products",
    bytes,
    originalName: `${slug}-${index + 1}.jpg`,
    visibility: "public",
    width: size,
    height: size,
  });
}

export async function renderProductPhotoBytes(
  slug: string,
  index: number,
  size = 900,
): Promise<Buffer> {
  const sourcePath = join(PRODUCT_PHOTO_DIR, `${slug}.jpg`);

  if (existsSync(sourcePath)) {
    const position = PRODUCT_CROP_POSITIONS[index % PRODUCT_CROP_POSITIONS.length] ?? "centre";
    return sharp(sourcePath)
      .rotate()
      .resize(size, size, { fit: "cover", position })
      .jpeg({ quality: 86 })
      .toBuffer();
  }

  if (existsSync(HERO_PATH)) {
    const meta = await sharp(HERO_PATH).metadata();
    const width = meta.width ?? 1024;
    const height = meta.height ?? 546;
    const crop = Math.min(width, height);
    const maxLeft = Math.max(0, width - crop);
    const left = maxLeft === 0 ? 0 : Math.round((index * 97) % maxLeft);
    const top = Math.max(0, Math.floor((height - crop) / 2));

    return sharp(HERO_PATH)
      .extract({ left, top, width: crop, height: crop })
      .resize(size, size)
      .modulate({
        brightness: 1.02 + (index % 4) * 0.03,
        saturation: 1.08 + (index % 3) * 0.04,
      })
      .jpeg({ quality: 84 })
      .toBuffer();
  }

  return goldFallback(size, index * 17);
}

export async function saveChildAvatar(
  ctx: SeedContext,
  initials: string,
  paletteIndex: number,
): Promise<SavedSeedFile> {
  const size = 400;
  const [from, to] = AVATAR_PALETTES[paletteIndex % AVATAR_PALETTES.length] ?? ["#C9A227", "#8A6A12"];
  const label = initials.slice(0, 2).toUpperCase();

  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${from}"/>
          <stop offset="100%" stop-color="${to}"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#g)"/>
      <circle cx="200" cy="200" r="128" fill="#ffffff" opacity="0.18"/>
      <text x="200" y="228" text-anchor="middle" font-size="108" font-family="Georgia, serif" fill="#fff8e7">${label}</text>
    </svg>`,
  );

  const bytes = await sharp(svg).jpeg({ quality: 86 }).toBuffer();

  return saveJpeg(ctx, {
    folder: "children",
    bytes,
    originalName: `avatar-${label}.jpg`,
    visibility: "private",
    width: size,
    height: size,
  });
}

export async function saveReceiptImage(
  ctx: SeedContext,
  referenceNumber: string,
  amountRial: number,
): Promise<SavedSeedFile> {
  const width = 720;
  const height = 960;
  const amount = amountRial.toLocaleString("en-US");

  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="${width}" height="${height}" fill="#f7f4ea"/>
      <rect x="36" y="36" width="${width - 72}" height="${height - 72}" fill="#ffffff" stroke="#c9a227" stroke-width="3"/>
      <text x="360" y="120" text-anchor="middle" font-size="28" font-family="Georgia, serif" fill="#8A6A12">HAFT MANZOOMEH</text>
      <text x="360" y="158" text-anchor="middle" font-size="16" font-family="Georgia, serif" fill="#7A6540">Card-to-card receipt (demo)</text>
      <line x1="80" y1="190" x2="640" y2="190" stroke="#e6d5a8" stroke-width="2"/>
      <text x="90" y="250" font-size="18" font-family="Georgia, serif" fill="#5c4a28">Ref: ${referenceNumber}</text>
      <text x="90" y="300" font-size="18" font-family="Georgia, serif" fill="#5c4a28">Amount: ${amount} Rial</text>
      <text x="90" y="350" font-size="18" font-family="Georgia, serif" fill="#5c4a28">Status: transferred</text>
      <rect x="90" y="420" width="540" height="180" fill="#f5e6c4" opacity="0.7"/>
      <text x="360" y="520" text-anchor="middle" font-size="20" font-family="Georgia, serif" fill="#8A6A12">SAMPLE RECEIPT</text>
    </svg>`,
  );

  const bytes = await sharp(svg).jpeg({ quality: 82 }).toBuffer();

  return saveJpeg(ctx, {
    folder: "receipts",
    bytes,
    originalName: `receipt-${referenceNumber}.jpg`,
    visibility: "private",
    width,
    height,
  });
}
