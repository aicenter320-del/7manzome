import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

import { isStaff } from "@/server/auth/rbac";
import { getSessionUser } from "@/server/auth/session";
import { readStoredFile } from "@/server/storage/file-storage";
import { contentDispositionHeader } from "@/shared/lib/content-disposition";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await params;
  const file = await readStoredFile(fileId);

  if (!file) notFound();

  if (file.visibility !== "public") {
    const user = await getSessionUser();
    const allowed =
      user !== null && (isStaff(user.roles) || file.uploadedByUserId === user.id);

    if (!allowed) {
      return new NextResponse("دسترسی ندارید.", { status: 403 });
    }
  }

  const disposition = contentDispositionHeader(file.originalName);

  return new NextResponse(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.mimeType,
      "Cache-Control": file.visibility === "public" ? "public, max-age=86400" : "private, max-age=3600",
      ...(disposition ? { "Content-Disposition": disposition } : {}),
    },
  });
}
