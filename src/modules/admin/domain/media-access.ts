import type { UserRole } from "@/shared/types/enums";

/** پوشه‌های منطقی کتابخانه فایل؛ با پیشوند `storage_key` یکی است. */
export const MEDIA_FOLDERS = ["products", "children", "receipts"] as const;
export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

export const MEDIA_FOLDER_LABELS: Record<MediaFolder, string> = {
  products: "محصولات",
  children: "کودکان",
  receipts: "رسیدها",
};

/** نقش‌هایی که هر پوشه را می‌بینند؛ هم‌تراز مجوزهای rbac. */
const VIEW_BY_FOLDER: Record<MediaFolder, readonly UserRole[]> = {
  products: ["super_admin", "order_manager", "content_manager", "customer_support", "fulfillment"],
  children: ["super_admin", "customer_support"],
  receipts: ["super_admin", "finance", "order_manager", "customer_support"],
};

/** حذف نرم: محصول با catalog:write، رسید با payment:review، کودک فقط مدیر ارشد. */
const DELETE_BY_FOLDER: Record<MediaFolder, readonly UserRole[]> = {
  products: ["super_admin", "content_manager"],
  children: ["super_admin"],
  receipts: ["super_admin", "finance"],
};

export function isMediaFolder(value: string): value is MediaFolder {
  return (MEDIA_FOLDERS as readonly string[]).includes(value);
}

/** پوشه‌هایی که این نقش‌ها حق دیدنش را دارند. */
export function foldersForRoles(roles: readonly UserRole[]): MediaFolder[] {
  return MEDIA_FOLDERS.filter((folder) =>
    roles.some((role) => VIEW_BY_FOLDER[folder].includes(role)),
  );
}

/** آیا این نقش‌ها می‌توانند فایل این پوشه را حذف نرم کنند؟ */
export function canDeleteMediaFolder(
  roles: readonly UserRole[],
  folder: MediaFolder,
): boolean {
  return roles.some((role) => DELETE_BY_FOLDER[folder].includes(role));
}
