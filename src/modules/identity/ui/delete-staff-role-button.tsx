"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteStaffRoleAction } from "@/modules/identity/actions/staff-role.actions";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

export function DeleteStaffRoleButton({
  roleId,
  title,
  disabledReason,
}: {
  roleId: string;
  title: string;
  disabledReason?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (disabledReason) {
    return <p className="text-sm text-muted-foreground">{disabledReason}</p>;
  }

  function confirm() {
    startTransition(async () => {
      const result = await deleteStaffRoleAction({ roleId });
      if (!result.ok) {
        toast.error(result.error);
        setOpen(false);
        return;
      }
      toast.success("نقش حذف شد.");
      router.push("/admin/roles");
      router.refresh();
    });
  }

  return (
    <>
      <Button type="button" variant="destructive" onClick={() => setOpen(true)}>
        حذف نقش
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!isPending) setOpen(next);
        }}
      >
        <DialogContent showCloseButton={!isPending}>
          <DialogHeader>
            <DialogTitle>حذف نقش</DialogTitle>
            <DialogDescription>
              نقش «{title}» حذف شود؟ این کار برگشت‌پذیر نیست.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="destructive" disabled={isPending} onClick={confirm}>
              حذف
            </Button>
            <Button type="button" variant="outline" disabled={isPending} onClick={() => setOpen(false)}>
              انصراف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
