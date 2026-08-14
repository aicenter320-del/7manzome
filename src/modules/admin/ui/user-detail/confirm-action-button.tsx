"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

export function ConfirmActionButton({
  label,
  title,
  description,
  confirmLabel = "تایید",
  variant = "outline",
  disabled,
  onConfirm,
}: {
  label: string;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "outline" | "destructive";
  disabled?: boolean;
  onConfirm: () => Promise<{ ok: true; data?: unknown } | { ok: false; error: string }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const result = await onConfirm();
      if (!result.ok) {
        toast.error(result.error);
        setOpen(false);
        return;
      }
      toast.success("انجام شد.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant={variant}
        disabled={disabled || isPending}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!isPending) setOpen(next);
        }}
      >
        <DialogContent showCloseButton={!isPending}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant={variant === "destructive" ? "destructive" : "default"}
              disabled={isPending}
              onClick={confirm}
            >
              {confirmLabel}
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
