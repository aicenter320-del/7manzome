"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { reviewAndSettlePayment } from "@/modules/admin/actions/admin.actions";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Textarea } from "@/shared/ui/textarea";

export function PaymentReviewForm({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const decide = (decision: "confirmed" | "rejected") => {
    setError(null);
    startTransition(async () => {
      const result = await reviewAndSettlePayment({
        paymentId,
        decision,
        ...(decision === "rejected" ? { reason } : {}),
      });
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(decision === "confirmed" ? "پرداخت تایید شد." : "پرداخت رد شد.");
      router.refresh();
    });
  };

  return (
    <div className="grid gap-4 rounded-xl border border-border bg-card p-5">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <FormField id="rejectReason" label="دلیل رد" hint="برای رد پرداخت الزامی است.">
        <Textarea id="rejectReason" value={reason} onChange={(event) => setReason(event.target.value)} rows={3} />
      </FormField>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="success" disabled={isPending} onClick={() => decide("confirmed")}>
          {isPending ? <Loader2Icon className="animate-spin" /> : null}
          تایید و تسویه
        </Button>
        <Button type="button" variant="destructive" disabled={isPending} onClick={() => decide("rejected")}>
          رد پرداخت
        </Button>
      </div>
    </div>
  );
}
