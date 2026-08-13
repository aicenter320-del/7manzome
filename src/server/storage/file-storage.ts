import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, join, normalize, resolve, sep } from "node:path";

import { eq } from "drizzle-orm";

import { env } from "@/shared/config/env";
import type { FileVisibility } from "@/shared/types/enums";

import { db } from "../db";
import { mediaFiles } from "../db/schema";
import { logger } from "../logger";

/**
 * ذخیره‌سازی فایل‌های آپلودی.
 *
 * قوانین امنیتی (docs/05-ops/security.md):
 *   - ذخیره بیرون از public؛ سرو از مسیر کنترل‌شده app/api/files
 *   - نوع فایل از محتوا بررسی می‌شود، نه از هدر ارسالی کلاینت
 *   - نام فایل ذخیره‌شده را سرور تولید می‌کند، نه کاربر
 *   - مسیر ورودی برای جلوگیری از path traversal پاک‌سازی می‌شود
 */

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

const EXTENSION_BY_MIME: Record<AllowedMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

/**
 * امضای بایتی ابتدای فایل (magic number).
 * کلاینت می‌تواند هر Content-Type دلخواهی بفرستد، پس نوع واقعی را از محتوا می‌خوانیم.
 */
function detectMimeType(bytes: Uint8Array): AllowedMimeType | null {
  const startsWith = (signature: readonly number[], offset = 0): boolean =>
    signature.every((byte, index) => bytes[offset + index] === byte);

  if (startsWith([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith([0x25, 0x50, 0x44, 0x46])) return "application/pdf";

  // WebP: "RIFF" ... "WEBP"
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) {
    return "image/webp";
  }

  return null;
}

export class FileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileValidationError";
  }
}

function storageRoot(): string {
  return resolve(env.STORAGE_DIR);
}

/**
 * تبدیل کلید نسبی به مسیر مطلق، با محافظت در برابر path traversal.
 * هر کلیدی که بیرون از ریشه ذخیره‌سازی بیفتد رد می‌شود.
 */
function resolveStoragePath(storageKey: string): string {
  const root = storageRoot();
  const target = resolve(join(root, normalize(storageKey)));

  if (target !== root && !target.startsWith(root + sep)) {
    throw new FileValidationError("مسیر فایل نامعتبر است.");
  }

  return target;
}

export interface SaveFileInput {
  file: File;
  /** پوشه منطقی: receipts، children، products و ... */
  folder: string;
  visibility?: FileVisibility;
  uploadedByUserId?: string | null;
}

export interface SavedFile {
  id: string;
  storageKey: string;
  mimeType: AllowedMimeType;
  sizeBytes: number;
}

/** ذخیره فایل آپلودی و ثبت رکورد آن. */
export async function saveUploadedFile(input: SaveFileInput): Promise<SavedFile> {
  const { file, folder } = input;

  if (file.size === 0) {
    throw new FileValidationError("فایل خالی است.");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new FileValidationError(
      `حجم فایل نباید بیشتر از ${MAX_UPLOAD_BYTES / 1024 / 1024} مگابایت باشد.`,
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = detectMimeType(bytes);

  if (!detected) {
    throw new FileValidationError(
      "نوع فایل پشتیبانی نمی‌شود. فقط تصویر JPG، PNG، WebP و فایل PDF قابل ارسال است.",
    );
  }

  // پوشه منطقی هم پاک‌سازی می‌شود تا از راه folder هم نتوان بالا رفت.
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "");
  if (safeFolder === "") {
    throw new FileValidationError("پوشه مقصد نامعتبر است.");
  }

  const extension = EXTENSION_BY_MIME[detected];
  const fileName = `${Date.now()}-${randomBytes(8).toString("hex")}.${extension}`;
  const storageKey = `${safeFolder}/${fileName}`;
  const absolutePath = resolveStoragePath(storageKey);

  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, bytes);

  const checksum = createHash("sha256").update(bytes).digest("hex");

  const [row] = await db
    .insert(mediaFiles)
    .values({
      storageKey,
      originalName: file.name.slice(0, 200),
      mimeType: detected,
      sizeBytes: file.size,
      visibility: input.visibility ?? "private",
      checksum,
      uploadedByUserId: input.uploadedByUserId ?? null,
    })
    .returning({ id: mediaFiles.id });

  if (!row) {
    // اگر ثبت رکورد شکست خورد، فایل یتیم روی دیسک نمی‌گذاریم.
    await unlink(absolutePath).catch(() => undefined);
    throw new Error("ثبت رکورد فایل شکست خورد.");
  }

  logger.info("file uploaded", {
    fileId: row.id,
    folder: safeFolder,
    mimeType: detected,
    sizeBytes: file.size,
  });

  return { id: row.id, storageKey, mimeType: detected, sizeBytes: file.size };
}

export interface StoredFile {
  bytes: Buffer;
  mimeType: string;
  visibility: FileVisibility;
  uploadedByUserId: string | null;
  originalName: string | null;
}

/** خواندن فایل بر اساس شناسه رکورد. بررسی دسترسی وظیفه فراخوان است. */
export async function readStoredFile(fileId: string): Promise<StoredFile | null> {
  const rows = await db
    .select({
      storageKey: mediaFiles.storageKey,
      mimeType: mediaFiles.mimeType,
      visibility: mediaFiles.visibility,
      uploadedByUserId: mediaFiles.uploadedByUserId,
      originalName: mediaFiles.originalName,
      deletedAt: mediaFiles.deletedAt,
    })
    .from(mediaFiles)
    .where(eq(mediaFiles.id, fileId))
    .limit(1);

  const row = rows[0];
  if (!row || row.deletedAt) return null;

  try {
    const bytes = await readFile(resolveStoragePath(row.storageKey));
    return {
      bytes,
      mimeType: row.mimeType,
      visibility: row.visibility,
      uploadedByUserId: row.uploadedByUserId,
      originalName: row.originalName,
    };
  } catch (error) {
    logger.error("stored file missing on disk", { fileId, error: String(error) });
    return null;
  }
}

/** حذف نرم فایل؛ رکورد می‌ماند تا ارجاع‌های تاریخی نشکند. */
export async function softDeleteFile(fileId: string): Promise<void> {
  await db.update(mediaFiles).set({ deletedAt: Date.now() }).where(eq(mediaFiles.id, fileId));
}
