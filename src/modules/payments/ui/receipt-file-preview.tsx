import { FileTextIcon } from "lucide-react";

import { getMediaFileRecord } from "@/server/storage/file-storage";

export async function ReceiptFilePreview({ fileId }: { fileId: string | null }) {
  if (!fileId) {
    return (
      <p className="text-sm text-muted-foreground">تصویر رسید ارسال نشده است.</p>
    );
  }

  const file = await getMediaFileRecord(fileId);
  if (!file || file.deletedAt) {
    return <p className="text-sm text-muted-foreground">فایل رسید در دسترس نیست.</p>;
  }

  const href = `/api/files/${file.id}`;
  const isImage = file.mimeType.startsWith("image/");

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="relative mt-3 block overflow-hidden rounded-2xl bg-muted"
    >
      {isImage ? (
        // مرورگر کوکی سشن را می‌فرستد؛ بهینه‌ساز next/image برای فایل private کوکی ندارد.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={href}
          alt="تصویر رسید پرداخت"
          className="max-h-112 w-full object-contain"
        />
      ) : (
        <span className="flex min-h-32 flex-col items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
          <FileTextIcon className="size-10" />
          مشاهده فایل رسید
        </span>
      )}
    </a>
  );
}
