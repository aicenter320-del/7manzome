import Link from "next/link";

import { getChildrenForUser } from "@/modules/children";
import { requireUser } from "@/server/auth/guards";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";

import { CreateTreasureForm } from "../create-treasure-form";

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function NewTreasurePage({
  searchParams,
}: {
  searchParams: Promise<{ childId?: string | string[] }>;
}) {
  const user = await requireUser("/dashboard/treasures/new");
  const children = await getChildrenForUser(user.id);
  const params = await searchParams;
  const defaultChildId = firstParam(params.childId);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="گنجینه جدید"
        description="هر کودک می‌تواند بیش از یک گنجینه داشته باشد؛ مثلاً گنجینه دائمی و گنجینه تولد."
      />

      {children.length === 0 ? (
        <EmptyState
          title="ابتدا پروفایل کودک را بسازید"
          description="گنجینه باید به یک کودک مشخص گره بخورد."
          action={
            <Button asChild>
              <Link href="/dashboard/children/new">افزودن کودک</Link>
            </Button>
          }
        />
      ) : (
        <CreateTreasureForm
          childrenList={children}
          {...(defaultChildId ? { defaultChildId } : {})}
        />
      )}
    </div>
  );
}
