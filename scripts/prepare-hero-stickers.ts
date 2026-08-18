/**
 * حذف بوم کرم/شطرنجی دور استیکرهای هیرو و نوشتن PNG با آلفا.
 * فقط هنگام آماده‌سازی دارایی اجرا می‌شود، نه در بیلد.
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

import sharp from "sharp";

const SRC = join(process.cwd(), "src/assets/images");
const OUT = join(SRC, "hero-stickers");

const FILES = [
  { src: "hero-sticker-celestial.png", dest: "celestial.png" },
  { src: "hero-sticker-portrait.png", dest: "portrait.png" },
  { src: "hero-sticker-gift.png", dest: "gift.png" },
] as const;

function chroma(r: number, g: number, b: number): number {
  return Math.max(r, g, b) - Math.min(r, g, b);
}

function luma(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function creamYellow(r: number, g: number, b: number): number {
  return (r + g) / 2 - b;
}

function isCreamPaper(r: number, g: number, b: number): boolean {
  const l = luma(r, g, b);
  return l > 228 && chroma(r, g, b) < 22 && creamYellow(r, g, b) >= 2;
}

function isSubjectCore(r: number, g: number, b: number): boolean {
  const c = chroma(r, g, b);
  const l = luma(r, g, b);
  if (c < 14 && l >= 90 && l <= 220) return false;
  if (c > 18) return true;
  return l < 90;
}

function cornerMode(
  data: Buffer,
  width: number,
  height: number,
  channels: number,
): "cream" | "checker" {
  const pts = [
    [2, 2],
    [width - 3, 2],
    [2, height - 3],
    [width - 3, height - 3],
  ] as const;
  let yellow = 0;
  for (const [x, y] of pts) {
    const i = (y * width + x) * channels;
    yellow += creamYellow(data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0);
  }
  return yellow / pts.length >= 3 ? "cream" : "checker";
}

function dilate(mask: Uint8Array, width: number, height: number, radius: number): Uint8Array {
  let current = mask;
  for (let step = 0; step < radius; step += 1) {
    const next = new Uint8Array(current);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = y * width + x;
        if (current[i]) continue;
        const up = y > 0 && current[(y - 1) * width + x];
        const down = y + 1 < height && current[(y + 1) * width + x];
        const left = x > 0 && current[y * width + (x - 1)];
        const right = x + 1 < width && current[y * width + (x + 1)];
        if (up || down || left || right) next[i] = 1;
      }
    }
    current = next;
  }
  return current;
}

function keepLargest(mask: Uint8Array, width: number, height: number): Uint8Array {
  const seen = new Uint8Array(mask.length);
  let best: number[] = [];

  for (let start = 0; start < mask.length; start += 1) {
    if (!mask[start] || seen[start]) continue;
    const stack = [start];
    const cells: number[] = [];
    seen[start] = 1;

    while (stack.length > 0) {
      const idx = stack.pop();
      if (idx === undefined) break;
      cells.push(idx);
      const x = idx % width;
      const y = Math.floor(idx / width);
      const neighbors = [
        x > 0 ? idx - 1 : -1,
        x + 1 < width ? idx + 1 : -1,
        y > 0 ? idx - width : -1,
        y + 1 < height ? idx + width : -1,
      ];
      for (const n of neighbors) {
        if (n < 0 || seen[n] || !mask[n]) continue;
        seen[n] = 1;
        stack.push(n);
      }
    }

    if (cells.length > best.length) best = cells;
  }

  const kept = new Uint8Array(mask.length);
  for (const idx of best) kept[idx] = 1;
  return kept;
}

function dropDust(mask: Uint8Array, width: number, height: number, minArea: number): Uint8Array {
  const seen = new Uint8Array(mask.length);
  const kept = new Uint8Array(mask.length);

  for (let start = 0; start < mask.length; start += 1) {
    if (!mask[start] || seen[start]) continue;
    const stack = [start];
    const cells: number[] = [];
    seen[start] = 1;

    while (stack.length > 0) {
      const idx = stack.pop();
      if (idx === undefined) break;
      cells.push(idx);
      const x = idx % width;
      const y = Math.floor(idx / width);
      const neighbors = [
        x > 0 ? idx - 1 : -1,
        x + 1 < width ? idx + 1 : -1,
        y > 0 ? idx - width : -1,
        y + 1 < height ? idx + width : -1,
      ];
      for (const n of neighbors) {
        if (n < 0 || seen[n] || !mask[n]) continue;
        seen[n] = 1;
        stack.push(n);
      }
    }

    if (cells.length < minArea) continue;
    for (const idx of cells) kept[idx] = 1;
  }

  return kept;
}

function floodPaper(
  data: Buffer,
  width: number,
  height: number,
  channels: number,
  walk: (r: number, g: number, b: number) => boolean,
): Uint8Array {
  const paper = new Uint8Array(width * height);
  const queue: number[] = [];
  const push = (x: number, y: number) => {
    const idx = y * width + x;
    if (paper[idx]) return;
    const i = idx * channels;
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    if (!walk(r, g, b)) return;
    paper[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x += 1) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    push(0, y);
    push(width - 1, y);
  }

  while (queue.length > 0) {
    const idx = queue.pop();
    if (idx === undefined) break;
    const x = idx % width;
    const y = Math.floor(idx / width);
    if (x > 0) push(x - 1, y);
    if (x + 1 < width) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y + 1 < height) push(x, y + 1);
  }

  return paper;
}

async function punch(file: (typeof FILES)[number]): Promise<void> {
  const source = join(SRC, file.src);
  const dest = join(OUT, file.dest);
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const mode = cornerMode(data, width, height, channels);

  let keep: Uint8Array;

  if (mode === "checker") {
    const core = new Uint8Array(width * height);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = (y * width + x) * channels;
        const r = data[i] ?? 0;
        const g = data[i + 1] ?? 0;
        const b = data[i + 2] ?? 0;
        if (isSubjectCore(r, g, b)) core[y * width + x] = 1;
      }
    }
    keep = dropDust(dilate(core, width, height, 10), width, height, 120);
    console.log(`${file.src}: هستهٔ رنگی + حاشیهٔ سفید`);
  } else {
    const paper = floodPaper(data, width, height, channels, isCreamPaper);
    keep = new Uint8Array(width * height);
    for (let i = 0; i < keep.length; i += 1) keep[i] = paper[i] ? 0 : 1;
    keep = dropDust(dilate(keep, width, height, 2), width, height, 80);
    keep = keepLargest(keep, width, height);
    console.log(`${file.src}: بوم کرم از لبه`);
  }

  const out = Buffer.from(data);
  for (let i = 0; i < keep.length; i += 1) {
    if (!keep[i]) out[i * channels + 3] = 0;
  }

  await sharp(out, { raw: { width, height, channels } })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(dest);

  const meta = await sharp(dest).metadata();
  console.log(`  → ${file.dest} ${meta.width}×${meta.height} alpha=${meta.hasAlpha}`);
}

async function main(): Promise<void> {
  await mkdir(OUT, { recursive: true });
  for (const file of FILES) {
    await punch(file);
  }
}

void main();
