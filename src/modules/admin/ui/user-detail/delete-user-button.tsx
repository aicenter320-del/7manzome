"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteAdminUser } from "@/modules/admin/actions/admin.actions";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

export function DeleteUserButton({
  userId,
  displayName,
  canDelete,
  isSelf,
}: {
  userId: string;
  displayName: string;
  canDelete: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (isSelf) {
    return <p className="text-sm text-muted-foreground">حساب خودتان را نمی‌توانید حذف کنید.</p>;
  }

  if (!canDelete) {
    return (
      <p className="text-sm text-muted-foreground">
        این کاربر سفارش یا گنجینه دارد و حذف نمی‌شود. می‌توانید حساب را مسدود کنید.
      </p>
    );
  }

  function confirm() {
    startTransition(async () => {
      const result = await deleteAdminUser({ userId });
      if (!result.ok) {
        toast.error(result.error);
        setOpen(false);
        return;
      }
      toast.success("حساب کاربر حذف شد.");
      router.push("/admin/users");
      router.refresh();
    });
  }

  return (
    <>
      <Button type="button" variant="destructive" onClick={() => setOpen(true)}>
        حذف حساب
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!isPending) setOpen(next);
        }}
      >
        <DialogContent showCloseButton={!isPending}>
          <DialogHeader>
            <DialogTitle>حذف حساب</DialogTitle>
            <DialogDescription>
              حساب «{displayName}» برای همیشه حذف شود؟ این کار برگشت‌پذیر نیست.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="destructive" disabled={isPending} onClick={confirm}>
              حذف
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
              انصراف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
