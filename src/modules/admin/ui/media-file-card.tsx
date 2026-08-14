import Link from "next/link";
import { FileTextIcon } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { toPersianDigits } from "@/shared/lib/persian";
import { Badge } from "@/shared/ui/badge";
import { JalaliDate } from "@/shared/ui/jalali-date";

import type { MediaFolder } from "../domain/media-access";
import { MEDIA_FOLDER_LABELS } from "../domain/media-access";
import { DeleteMediaFileButton } from "./delete-media-file-button";

function formatSizeFa(bytes: number): string {
  if (bytes < 1024) return `${toPersianDigits(bytes)} بایت`;
  const kilo = Math.round(bytes / 1024);
  if (kilo < 1024) return `${toPersianDigits(kilo)} کیلوبایت`;
  const tenths = Math.round((bytes * 10) / (1024 * 1024));
  const whole = Math.floor(tenths / 10);
  const frac = tenths % 10;
  return frac === 0
    ? `${toPersianDigits(whole)} مگابایت`
    : `${toPersianDigits(whole)}٫${toPersianDigits(frac)} مگابایت`;
}

export function MediaFileCard({
  file,
  folderLabel,
  canDelete,
}: {
  file: {
    id: string;
    originalName: string | null;
    mimeType: string;
    sizeBytes: number;
    visibility: "public" | "private";
    createdAt: number;
    folder: string;
  };
  folderLabel: string;
  canDelete: boolean;
}) {
  const isImage = file.mimeType.startsWith("image/");
  const title = file.originalName ?? file.id;

  return (
    <article className="glass grid gap-3 overflow-hidden rounded-3xl p-3">
      <a
        href={`/api/files/${file.id}`}
        target="_blank"
        rel="noreferrer"
        className="relative block aspect-square overflow-hidden rounded-2xl bg-muted"
      >
        {isImage ? (
          // مرورگر کوکی سشن را می‌فرستد؛ بهینه‌ساز next/image برای فایل private کوکی ندارد.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/files/${file.id}`} alt="" className="size-full object-cover" />
        ) : (
          <span className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <FileTextIcon className="size-10" />
            <span className="text-xs">PDF</span>
          </span>
        )}
      </a>

      <div className="grid gap-1 px-1">
        <p className="line-clamp-2 text-sm font-medium" title={title}>
          {title}
        </p>
        <p className="text-xs text-muted-foreground">
          {folderLabel}
          <span className="mx-1">·</span>
          {formatSizeFa(file.sizeBytes)}
        </p>
        <p className="text-xs text-muted-foreground">
          <JalaliDate at={file.createdAt} variant="date" />
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Badge variant={file.visibility === "public" ? "gold" : "muted"}>
            {file.visibility === "public" ? "عمومی" : "خصوصی"}
          </Badge>
          {canDelete ? <DeleteMediaFileButton fileId={file.id} /> : null}
        </div>
      </div>
    </article>
  );
}

export function mediaFolderLabel(folder: string): string {
  return folder in MEDIA_FOLDER_LABELS
    ? MEDIA_FOLDER_LABELS[folder as MediaFolder]
    : folder;
}

export function FolderFilterLinks({
  allowed,
  active,
  className,
}: {
  allowed: readonly MediaFolder[];
  active: string | null;
  className?: string;
}) {
  const items: { href: string; label: string; isActive: boolean }[] = [
    { href: "/admin/files", label: "همه", isActive: active === null },
    ...allowed.map((folder) => ({
      href: `/admin/files?folder=${folder}`,
      label: MEDIA_FOLDER_LABELS[folder],
      isActive: active === folder,
    })),
  ];

  return (
    <nav className={cn("flex flex-wrap gap-2", className)} aria-label="فیلتر پوشه">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm",
            item.isActive
              ? "bg-gold-soft text-gold-deep"
              : "glass text-muted-foreground hover:text-foreground",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
