"use client";

import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/shared/lib/cn";
import { toPersianDigits } from "@/shared/lib/persian";
import { PAYMENT_STATUS_LABELS } from "@/shared/types/enums";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Money } from "@/shared/ui/money";

import { hoursRemaining } from "../domain/payment-status";
import type { BankAccount, Payment } from "../domain/types";

function formatCardNumber(cardNumber: string): string {
  return cardNumber.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");
}

function statusVariant(
  status: Payment["status"],
): "warning" | "info" | "success" | "destructive" | "muted" {
  switch (status) {
    case "awaiting_transfer":
      return "warning";
    case "receipt_submitted":
    case "under_review":
      return "info";
    case "confirmed":
      return "success";
    case "rejected":
      return "destructive";
    case "expired":
      return "muted";
  }
}

async function copyText(value: string, successMessage: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(successMessage);
  } catch {
    toast.error("کپی انجام نشد. لطفاً دستی کپی کنید.");
  }
}

export function PaymentStatusCard({
  payment,
  bankAccount,
  className,
}: {
  payment: Payment;
  bankAccount?: BankAccount | null;
  className?: string;
}) {
  const remaining = hoursRemaining(payment.expiresAt);
  const cardNumber = bankAccount?.cardNumber;

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>وضعیت پرداخت</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground ltr-nums" dir="ltr">
              {payment.paymentNumber}
            </p>
          </div>
          <Badge variant={statusVariant(payment.status)}>
            {PAYMENT_STATUS_LABELS[payment.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div>
          <p className="text-xs text-muted-foreground">مبلغ قابل پرداخت</p>
          <Money rial={payment.amountRial} className="text-lg font-semibold" />
        </div>

        {cardNumber ? (
          <div>
            <p className="text-xs text-muted-foreground">شماره کارت مقصد</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="font-medium ltr-nums" dir="ltr">
                {formatCardNumber(cardNumber)}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="کپی شماره کارت"
                onClick={() => copyText(cardNumber.replace(/\D/g, ""), "شماره کارت کپی شد.")}
              >
                <CopyIcon />
              </Button>
            </div>
            {bankAccount?.accountHolder ? (
              <p className="mt-1 text-xs text-muted-foreground">
                به نام {bankAccount.accountHolder}
              </p>
            ) : null}
          </div>
        ) : null}

        {payment.status === "rejected" && payment.rejectionReason ? (
          <p className="text-sm text-destructive">{payment.rejectionReason}</p>
        ) : null}

        {remaining !== null &&
        (payment.status === "awaiting_transfer" || payment.status === "rejected") ? (
          <p className="text-sm text-muted-foreground">
            {remaining > 0
              ? `${toPersianDigits(remaining)} ساعت تا پایان مهلت پرداخت`
              : "مهلت این پرداخت به پایان رسیده است."}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
