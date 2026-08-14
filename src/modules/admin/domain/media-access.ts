/** پوشه‌های منطقی کتابخانه فایل؛ با پیشوند `storage_key` یکی است. */
export const MEDIA_FOLDERS = ["products", "children", "receipts"] as const;
export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

export const MEDIA_FOLDER_LABELS: Record<MediaFolder, string> = {
  products: "محصولات",
  children: "کودکان",
  receipts: "رسیدها",
};

/** دیدن پوشه بر اساس مجوز؛ هم‌تراز rbac. */
const VIEW_BY_FOLDER: Record<MediaFolder, readonly string[]> = {
  products: ["catalog:read"],
  children: ["child:read"],
  receipts: ["payment:read"],
};

/** حذف نرم: محصول با catalog:write، رسید با payment:review، کودک فقط role:write (مدیر ارشد). */
const DELETE_BY_FOLDER: Record<MediaFolder, readonly string[]> = {
  products: ["catalog:write"],
  children: ["role:write"],
  receipts: ["payment:review"],
};

export function isMediaFolder(value: string): value is MediaFolder {
  return (MEDIA_FOLDERS as readonly string[]).includes(value);
}

/** پوشه‌هایی که این مجوزها حق دیدنش را دارند. */
export function foldersForPermissions(permissions: readonly string[]): MediaFolder[] {
  return MEDIA_FOLDERS.filter((folder) =>
    VIEW_BY_FOLDER[folder].some((permission) => permissions.includes(permission)),
  );
}

/** آیا این مجوزها می‌توانند فایل این پوشه را حذف نرم کنند؟ */
export function canDeleteMediaFolder(
  permissions: readonly string[],
  folder: MediaFolder,
): boolean {
  return DELETE_BY_FOLDER[folder].some((permission) => permissions.includes(permission));
}
