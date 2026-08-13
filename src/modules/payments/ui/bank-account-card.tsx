"use client";

import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

import type { BankAccount } from "../domain/types";

function formatCardNumber(cardNumber: string): string {
  return cardNumber.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");
}

async function copyText(value: string, successMessage: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(successMessage);
  } catch {
    toast.error("کپی انجام نشد. لطفاً دستی کپی کنید.");
  }
}

export function BankAccountCard({
  account,
  className,
}: {
  account: BankAccount;
  className?: string;
}) {
  const digits = account.cardNumber.replace(/\D/g, "");

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{account.title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{account.bankName}</p>
          </div>
          {account.isActive ? (
            <Badge variant="success">فعال</Badge>
          ) : (
            <Badge variant="muted">غیرفعال</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="grid gap-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">شماره کارت</p>
            <p className="font-medium ltr-nums" dir="ltr">
              {formatCardNumber(account.cardNumber)}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="کپی شماره کارت"
            onClick={() => copyText(digits, "شماره کارت کپی شد.")}
          >
            <CopyIcon />
            کپی
          </Button>
        </div>

        {account.iban ? (
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">شبا</p>
              <p className="font-medium ltr-nums" dir="ltr">
                {account.iban}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="کپی شماره شبا"
              onClick={() => copyText(account.iban ?? "", "شماره شبا کپی شد.")}
            >
              <CopyIcon />
              کپی
            </Button>
          </div>
        ) : null}

        <p className="text-sm text-muted-foreground">به نام {account.accountHolder}</p>
      </CardContent>
    </Card>
  );
}
