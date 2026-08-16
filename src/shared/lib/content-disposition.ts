/**
 * مقدار هدر Content-Disposition باید ByteString باشد (کد کمتر از ۲۵۶).
 * نام فارسی در `filename="…"` در undici/Next خطا می‌دهد و پاسخ تصویر خالی می‌شود.
 * RFC 6266: نام ASCII در filename، نام واقعی در filename* با UTF-8 درصدگذاری‌شده.
 */

export type ContentDispositionType = "inline" | "attachment";

function asciiFallback(name: string): string {
  const lastDot = name.lastIndexOf(".");
  const extRaw = lastDot > 0 ? name.slice(lastDot) : "";
  const stemRaw = lastDot > 0 ? name.slice(0, lastDot) : name;
  const ext = extRaw.replace(/[^\w.]/g, "");
  const stem =
    stemRaw.replace(/[^\u0020-\u007e]/g, "_").replace(/["\\;]/g, "_").trim() || "file";
  return `${stem}${ext}`;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[\r\n]/g, "").trim();
}

export function contentDispositionHeader(
  originalName: string | null | undefined,
  disposition: ContentDispositionType = "inline",
): string | undefined {
  if (!originalName) return undefined;

  const sanitized = sanitizeFileName(originalName);
  if (!sanitized) return undefined;

  const ascii = asciiFallback(sanitized);
  const encoded = encodeURIComponent(sanitized);

  return `${disposition}; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}
