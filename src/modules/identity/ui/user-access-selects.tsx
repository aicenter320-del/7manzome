"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { assignUserAccessAction } from "@/modules/identity/actions/user.actions";
import {
  assignableRoleOptions,
  assignedRoleFromRoles,
  isAssignableRoleValue,
  labelForAssignedRole,
  type StaffRoleOption,
} from "@/modules/identity/domain/user-access";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

export function UserRoleSelect({
  userId,
  roles,
  staffRoles,
}: {
  userId: string;
  roles: readonly string[];
  staffRoles: readonly StaffRoleOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const options = assignableRoleOptions(staffRoles);
  const current = assignedRoleFromRoles(roles);
  const [pending, setPending] = useState<string | null>(null);
  const [selectKey, setSelectKey] = useState(0);

  function closeDialog() {
    setPending(null);
    setSelectKey((key) => key + 1);
  }

  function confirm() {
    if (!pending) return;
    const role = pending;
    startTransition(async () => {
      const result = await assignUserAccessAction({ userId, role });
      if (!result.ok) {
        toast.error(result.error);
        closeDialog();
        return;
      }
      toast.success("نقش کاربر به‌روز شد.");
      setPending(null);
      router.refresh();
    });
  }

  return (
    <>
      <Select
        key={selectKey}
        disabled={isPending}
        value={current}
        onValueChange={(value) => {
          if (!isAssignableRoleValue(value, staffRoles) || value === current) return;
          setPending(value);
        }}
      >
        <SelectTrigger aria-label="نقش کاربر" className="glass h-9 min-w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.slug} value={option.slug}>
              {option.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open && !isPending) closeDialog();
        }}
      >
        <DialogContent showCloseButton={!isPending}>
          <DialogHeader>
            <DialogTitle>تغییر نقش کاربر</DialogTitle>
            <DialogDescription>
              {pending
                ? `نقش به «${labelForAssignedRole(pending, staffRoles)}» تغییر می‌کند. ادامه می‌دهید؟`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" disabled={isPending} onClick={confirm}>
              تایید
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={closeDialog}
            >
              انصراف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
