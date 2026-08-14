"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { decideKyc } from "@/modules/identity/actions/user.actions";
import {
  KYC_DECISION_LABELS,
  nextKycDecisions,
  type KycDecision,
} from "@/modules/identity/domain/kyc-status";
import { KYC_STATUS_LABELS, type KycStatus } from "@/shared/types/enums";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { FormField } from "@/shared/ui/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

import { KycStatusBadge } from "./kyc-status-badge";

export function KycDecisionSelect({
  userId,
  displayName,
  status,
}: {
  userId: string;
  displayName: string;
  status: KycStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pending, setPending] = useState<KycDecision | null>(null);
  const [reason, setReason] = useState("");
  const [selectKey, setSelectKey] = useState(0);
  const next = nextKycDecisions(status);

  if (next.length === 0) {
    return <KycStatusBadge status={status} />;
  }

  function closeDialog() {
    setPending(null);
    setReason("");
    setSelectKey((key) => key + 1);
  }

  function confirm() {
    if (!pending) return;
    if (pending === "rejected" && reason.trim().length === 0) {
      toast.error("برای رد احراز هویت، دلیل را بنویسید.");
      return;
    }
    const decision = pending;
    const note = reason.trim();
    startTransition(async () => {
      const result = await decideKyc({
        userId,
        decision,
        ...(decision === "rejected" ? { reason: note } : {}),
      });
      if (!result.ok) {
        toast.error(result.error);
        closeDialog();
        return;
      }
      toast.success(
        decision === "verified"
          ? "احراز هویت تایید شد."
          : decision === "rejected"
            ? "احراز هویت رد شد."
            : "احراز هویت لغو شد.",
      );
      setPending(null);
      setReason("");
      router.refresh();
    });
  }

  return (
    <>
      <Select
        key={selectKey}
        disabled={isPending}
        onValueChange={(value) => setPending(value as KycDecision)}
      >
        <SelectTrigger aria-label="احراز هویت کاربر" className="glass h-9 min-w-36">
          <SelectValue placeholder={KYC_STATUS_LABELS[status]} />
        </SelectTrigger>
        <SelectContent>
          {next.map((decision) => (
            <SelectItem key={decision} value={decision}>
              {KYC_DECISION_LABELS[decision]}
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
            <DialogTitle>{pending ? KYC_DECISION_LABELS[pending] : ""}</DialogTitle>
            <DialogDescription>
              {pending === "verified"
                ? `احراز هویت «${displayName}» تایید شود؟`
                : pending === "none"
                  ? `احراز هویت «${displayName}» لغو شود؟ کد ملی پاک نمی‌شود.`
                  : `احراز هویت «${displayName}» رد شود؟`}
            </DialogDescription>
          </DialogHeader>
          {pending === "rejected" ? (
            <FormField id={`kyc-reason-${userId}`} label="دلیل" required>
              <Textarea
                id={`kyc-reason-${userId}`}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                maxLength={300}
                disabled={isPending}
              />
            </FormField>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant={pending === "rejected" ? "destructive" : "default"}
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
