import Link from "next/link";

import { ChildAvatar, getChildrenForUser } from "@/modules/children";
import { requireUser } from "@/server/auth/guards";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";

export default async function ChildrenListPage() {
  const user = await requireUser("/dashboard/children");
  const children = await getChildrenForUser(user.id);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="کودکان"
        description="پروفایل هر کودک جدا از حساب شماست؛ گنجینه به نام او ساخته می‌شود."
        actions={
          <Button asChild>
            <Link href="/dashboard/children/new">کودک جدید</Link>
          </Button>
        }
      />

      {children.length === 0 ? (
        <EmptyState
          title="هنوز کودکی ثبت نشده"
          description="نام و تاریخ تولد او را وارد کنید تا مناسبت‌ها و هدایا درست پیشنهاد شوند."
          action={
            <Button asChild>
              <Link href="/dashboard/children/new">افزودن کودک</Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-3">
          {children.map((child) => (
            <li key={child.id}>
              <Link
                href={`/dashboard/children/${child.id}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:shadow-md"
              >
                <ChildAvatar
                  displayName={child.displayName}
                  avatarFileId={child.avatarFileId}
                  gender={child.gender}
                />
                <div>
                  <p className="font-medium">{child.displayName}</p>
                  <p className="text-sm text-muted-foreground">{child.ageLabel}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
