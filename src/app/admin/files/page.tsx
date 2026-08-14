import {
  canDeleteMediaFolder,
  foldersForRoles,
  isMediaFolder,
} from "@/modules/admin/domain/media-access";
import {
  FolderFilterLinks,
  MediaFileCard,
  mediaFolderLabel,
} from "@/modules/admin/ui/media-file-card";
import { requireStaff } from "@/server/auth/guards";
import { listMediaFiles } from "@/server/storage/file-storage";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";

export default async function AdminFilesPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string | string[] }>;
}) {
  const user = await requireStaff();
  const allowed = foldersForRoles(user.roles);
  const rawFolder = (await searchParams).folder;
  const requested = Array.isArray(rawFolder) ? rawFolder[0] : rawFolder;
  const activeFolder =
    requested && isMediaFolder(requested) && allowed.includes(requested) ? requested : null;
  const folders = activeFolder ? [activeFolder] : allowed;
  const files = await listMediaFiles({ folders });

  return (
    <div className="grid gap-6">
      <PageHeader
        title="فایل‌ها"
        description="عکس محصول، تصویر کودک و رسید پرداخت؛ بایت فایل روی دیسک است و مشخصات در پایگاه داده."
      />

      {allowed.length === 0 ? (
        <EmptyState
          title="به کتابخانه فایل دسترسی ندارید"
          description="برای دیدن فایل‌ها نقش مناسب لازم است."
        />
      ) : (
        <>
          <FolderFilterLinks allowed={allowed} active={activeFolder} />

          {files.length === 0 ? (
            <EmptyState
              title="فایلی در این بخش نیست"
              description="فایل‌ها هنگام آپلود عکس محصول، کودک یا رسید اینجا ظاهر می‌شوند."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {files.map((file) => (
                <MediaFileCard
                  key={file.id}
                  file={file}
                  folderLabel={mediaFolderLabel(file.folder)}
                  canDelete={
                    isMediaFolder(file.folder) &&
                    canDeleteMediaFolder(user.roles, file.folder)
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
