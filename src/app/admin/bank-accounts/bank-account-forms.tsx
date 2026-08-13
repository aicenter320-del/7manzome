"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import {
  createBankAccountAction,
  toggleBankAccountAction,
} from "@/modules/payments/actions/payment.actions";
import { toEnglishDigits } from "@/shared/lib/persian";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

export function CreateBankAccountForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="grid gap-4 rounded-xl border border-border bg-card p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        const form = new FormData(event.currentTarget);
        const iban = String(form.get("iban") ?? "").trim();

        startTransition(async () => {
          const result = await createBankAccountAction({
            title: String(form.get("title") ?? "").trim(),
            bankName: String(form.get("bankName") ?? "").trim(),
            cardNumber: toEnglishDigits(String(form.get("cardNumber") ?? "")),
            accountHolder: String(form.get("accountHolder") ?? "").trim(),
            ...(iban ? { iban } : {}),
            sortOrder: 0,
          });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          toast.success("حساب بانکی اضافه شد.");
          router.refresh();
        });
      }}
    >
      <h2 className="font-semibold">حساب جدید</h2>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <FormField id="title" label="عنوان" required>
        <Input id="title" name="title" required />
      </FormField>
      <FormField id="bankName" label="نام بانک" required>
        <Input id="bankName" name="bankName" required />
      </FormField>
      <FormField id="cardNumber" label="شماره کارت" required>
        <Input id="cardNumber" name="cardNumber" className="ltr-nums" dir="ltr" required />
      </FormField>
      <FormField id="iban" label="شبا" hint="اختیاری.">
        <Input id="iban" name="iban" className="ltr-nums" dir="ltr" />
      </FormField>
      <FormField id="accountHolder" label="صاحب حساب" required>
        <Input id="accountHolder" name="accountHolder" required />
      </FormField>
      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2Icon className="animate-spin" /> : null}
        ثبت حساب
      </Button>
    </form>
  );
}

export function ToggleBankAccountButton({
  bankAccountId,
  isActive,
}: {
  bankAccountId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await toggleBankAccountAction({
            bankAccountId,
            isActive: !isActive,
          });
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          router.refresh();
        });
      }}
    >
      {isActive ? "غیرفعال کردن" : "فعال کردن"}
    </Button>
  );
}
