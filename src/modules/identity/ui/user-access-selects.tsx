"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { assignUserAccessAction } from "@/modules/identity/actions/user.actions";
import {
  ASSIGNABLE_ROLE_LABELS,
  ASSIGNABLE_ROLES,
  assignedRoleFromRoles,
  isAssignableRole,
  type AssignableRole,
} from "@/modules/identity/domain/user-access";
import type { UserRole } from "@/shared/types/enums";
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
}: {
  userId: string;
  roles: UserRole[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const current = assignedRoleFromRoles(roles);
  const [pending, setPending] = useState<AssignableRole | null>(null);
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
          if (!isAssignableRole(value) || value === current) return;
          setPending(value);
        }}
      >
        <SelectTrigger aria-label="نقش کاربر" className="glass h-9 min-w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ASSIGNABLE_ROLES.map((role) => (
            <SelectItem key={role} value={role}>
              {ASSIGNABLE_ROLE_LABELS[role]}
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
                ? `نقش به «${ASSIGNABLE_ROLE_LABELS[pending]}» تغییر می‌کند. ادامه می‌دهید؟`
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
