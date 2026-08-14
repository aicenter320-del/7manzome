"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon, SaveIcon } from "lucide-react";

import {
  adminChangeTreasureStatus,
  adminDeleteEmptyTreasure,
  adminUpdateTreasure,
} from "@/modules/admin/actions/admin.actions";
import { TREASURE_STATUS_LABELS, type TreasureStatus } from "@/shared/types/enums";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { GoldWeight } from "@/shared/ui/gold-weight";

import { ConfirmActionButton } from "./confirm-action-button";

export interface AdminTreasureRow {
  id: string;
  title: string;
  status: TreasureStatus;
  childName: string;
  balanceMg: number;
  entryCount: number;
  contributorCount: number;
}

export function AdminTreasuresPanel({
  userId,
  treasures,
  canWrite,
}: {
  userId: string;
  treasures: AdminTreasureRow[];
  canWrite: boolean;
}) {
  if (treasures.length === 0) {
    return <EmptyState title="گنجینه‌ای ثبت نشده" />;
  }

  return (
    <div className="grid gap-6">
      {treasures.map((treasure) => (
        <TreasureCard
          key={treasure.id}
          userId={userId}
          treasure={treasure}
          canWrite={canWrite}
        />
      ))}
    </div>
  );
}

function TreasureCard({
  userId,
  treasure,
  canWrite,
}: {
  userId: string;
  treasure: AdminTreasureRow;
  canWrite: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const canDelete = treasure.entryCount === 0 && treasure.contributorCount === 0;
  const titleId = `treasure-title-${treasure.id}`;

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await adminUpdateTreasure({
        userId,
        treasureId: treasure.id,
        title: String(formData.get("title") ?? "").trim(),
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("گنجینه به‌روز شد.");
      router.refresh();
    });
  };

  return (
    <section className="grid gap-4 rounded-2xl glass p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-medium">{treasure.title}</h3>
          <p className="text-sm text-muted-foreground">{treasure.childName}</p>
        </div>
        <Badge variant="muted">{TREASURE_STATUS_LABELS[treasure.status]}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        موجودی: <GoldWeight mg={treasure.balanceMg} size="sm" />
      </p>

      <form action={handleSubmit} className="grid gap-4">
        <FormField id={titleId} label="عنوان">
          <Input
            id={titleId}
            name="title"
            defaultValue={treasure.title}
            disabled={!canWrite}
            required
          />
        </FormField>
        {canWrite ? (
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isPending} size="sm">
              {isPending ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
              ذخیره
            </Button>
            {treasure.status === "active" ? (
              <ConfirmActionButton
                label="بستن"
                title="بستن گنجینه"
                description={`گنجینه «${treasure.title}» بسته شود؟`}
                onConfirm={() =>
                  adminChangeTreasureStatus({
                    userId,
                    treasureId: treasure.id,
                    status: "closed",
                  })
                }
              />
            ) : null}
            {canDelete ? (
              <ConfirmActionButton
                label="حذف"
                title="حذف گنجینه"
                description={`گنجینه «${treasure.title}» حذف شود؟ فقط گنجینه بدون دفتر کل قابل حذف است.`}
                variant="destructive"
                onConfirm={() =>
                  adminDeleteEmptyTreasure({ userId, treasureId: treasure.id })
                }
              />
            ) : null}
          </div>
        ) : null}
      </form>
    </section>
  );
}
