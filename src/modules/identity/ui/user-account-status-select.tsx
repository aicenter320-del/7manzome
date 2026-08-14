"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { changeUserStatus } from "@/modules/identity/actions/user.actions";
import {
  USER_STATUS_LABELS,
  USER_STATUSES,
  type UserStatus,
} from "@/shared/types/enums";
import { Badge } from "@/shared/ui/badge";
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

export function AccountStatusBadge({ status }: { status: UserStatus }) {
  return (
    <Badge variant={status === "suspended" ? "destructive" : "success"}>
      {USER_STATUS_LABELS[status]}
    </Badge>
  );
}

export function UserAccountStatusSelect({
  userId,
  displayName,
  status,
  isSelf,
}: {
  userId: string;
  displayName: string;
  status: UserStatus;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pending, setPending] = useState<UserStatus | null>(null);
  const [selectKey, setSelectKey] = useState(0);

  if (isSelf) {
    return <AccountStatusBadge status={status} />;
  }

  function closeDialog() {
    setPending(null);
    setSelectKey((key) => key + 1);
  }

  function confirm() {
    if (!pending) return;
    const next = pending;
    startTransition(async () => {
      const result = await changeUserStatus({ userId, status: next });
      if (!result.ok) {
        toast.error(result.error);
        closeDialog();
        return;
      }
      toast.success(
        next === "suspended" ? "حساب کاربر مسدود شد." : "حساب کاربر فعال شد.",
      );
      setPending(null);
      router.refresh();
    });
  }

  return (
    <>
      <Select
        key={selectKey}
        disabled={isPending}
        value={status}
        onValueChange={(value) => {
          if (value === status) return;
          setPending(value as UserStatus);
        }}
      >
        <SelectTrigger aria-label="وضعیت حساب" className="glass h-9 min-w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {USER_STATUSES.map((item) => (
            <SelectItem key={item} value={item}>
              {USER_STATUS_LABELS[item]}
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
            <DialogTitle>
              {pending === "suspended" ? "مسدود کردن حساب" : "فعال کردن حساب"}
            </DialogTitle>
            <DialogDescription>
              {pending === "suspended"
                ? `حساب «${displayName}» مسدود شود؟ از همه دستگاه‌ها خارج می‌شود.`
                : `حساب «${displayName}» دوباره فعال شود؟`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant={pending === "suspended" ? "destructive" : "default"}
              disabled={isPending}
              onClick={confirm}
            >
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
