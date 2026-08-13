"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon, UploadIcon } from "lucide-react";

import { parseTomanInput, formatRial } from "@/shared/lib/money";
import { toEnglishDigits } from "@/shared/lib/persian";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

import { submitReceiptAction, uploadPaymentReceipt } from "../actions/payment.actions";

function toDatetimeLocalValue(epochMs: number): string {
  const date = new Date(epochMs);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function datetimeLocalToEpoch(value: string): number | null {
  if (!value) return null;
  const epoch = new Date(value).getTime();
  return Number.isFinite(epoch) ? epoch : null;
}

function firstFieldError(
  fieldErrors: Record<string, string[]> | undefined,
  key: string,
): string | undefined {
  return fieldErrors?.[key]?.[0];
}

export function ReceiptForm({
  paymentId,
  expectedAmountRial,
  redirectTo,
}: {
  paymentId: string;
  expectedAmountRial?: number;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [referenceNumber, setReferenceNumber] = useState("");
  const [paidAmountToman, setPaidAmountToman] = useState("");
  const [payerName, setPayerName] = useState("");
  const [payerCardLast4, setPayerCardLast4] = useState("");
  const [bankName, setBankName] = useState("");
  const [paidAt, setPaidAt] = useState(() => toDatetimeLocalValue(Date.now()));
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const submit = () => {
    setFormError(null);
    setFieldErrors({});

    const paidAmountRial = parseTomanInput(paidAmountToman);
    if (paidAmountRial === null) {
      setFieldErrors({ paidAmountRial: ["مبلغ واریزی را به تومان وارد کنید"] });
      return;
    }

    const paidAtEpoch = datetimeLocalToEpoch(paidAt);
    if (paidAtEpoch === null) {
      setFieldErrors({ paidAt: ["زمان واریز را انتخاب کنید"] });
      return;
    }

    startTransition(async () => {
      let receiptFileId = uploadedFileId;

      if (file && !receiptFileId) {
        const formData = new FormData();
        formData.set("paymentId", paymentId);
        formData.set("file", file);

        const uploadResult = await uploadPaymentReceipt(formData);
        if (!uploadResult.ok) {
          setFormError(uploadResult.error);
          setFieldErrors({ file: [uploadResult.error] });
          return;
        }

        receiptFileId = uploadResult.data.fileId;
        setUploadedFileId(receiptFileId);
      }

      const last4 = toEnglishDigits(payerCardLast4).replace(/\D/g, "");

      const result = await submitReceiptAction({
        paymentId,
        referenceNumber,
        paidAmountRial,
        payerName,
        ...(last4 ? { payerCardLast4: last4 } : {}),
        ...(bankName.trim() ? { bankName: bankName.trim() } : {}),
        paidAt: paidAtEpoch,
        ...(note.trim() ? { note: note.trim() } : {}),
        ...(receiptFileId ? { receiptFileId } : {}),
      });

      if (!result.ok) {
        setFormError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      if (result.data.amountWarning) {
        toast.warning(result.data.amountWarning);
      } else {
        toast.success("رسید شما ثبت شد و در صف بررسی قرار گرفت.");
      }

      if (redirectTo) {
        router.replace(redirectTo);
      }
      router.refresh();
    });
  };

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <FormField
        id="referenceNumber"
        label="شماره پیگیری"
        hint="شماره پیگیری تراکنش را از پیامک بانک بردارید."
        error={firstFieldError(fieldErrors, "referenceNumber")}
        required
      >
        <Input
          id="referenceNumber"
          name="referenceNumber"
          className="ltr-nums"
          dir="ltr"
          value={referenceNumber}
          onChange={(event) => setReferenceNumber(event.target.value)}
          required
        />
      </FormField>

      <FormField
        id="paidAmountToman"
        label="مبلغ واریزی (تومان)"
        hint={
          expectedAmountRial !== undefined
            ? `مبلغ این پرداخت ${formatRial(expectedAmountRial)} است.`
            : "مبلغ را به تومان وارد کنید."
        }
        error={firstFieldError(fieldErrors, "paidAmountRial")}
        required
      >
        <Input
          id="paidAmountToman"
          name="paidAmountToman"
          inputMode="numeric"
          className="ltr-nums"
          dir="ltr"
          value={paidAmountToman}
          onChange={(event) => setPaidAmountToman(event.target.value)}
          required
        />
      </FormField>

      <FormField
        id="payerName"
        label="نام واریزکننده"
        error={firstFieldError(fieldErrors, "payerName")}
        required
      >
        <Input
          id="payerName"
          name="payerName"
          value={payerName}
          onChange={(event) => setPayerName(event.target.value)}
          required
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="payerCardLast4"
          label="چهار رقم آخر کارت"
          hint="اختیاری"
          error={firstFieldError(fieldErrors, "payerCardLast4")}
        >
          <Input
            id="payerCardLast4"
            name="payerCardLast4"
            inputMode="numeric"
            maxLength={4}
            className="ltr-nums"
            dir="ltr"
            value={payerCardLast4}
            onChange={(event) => setPayerCardLast4(event.target.value)}
          />
        </FormField>

        <FormField
          id="bankName"
          label="نام بانک مبدأ"
          hint="اختیاری"
          error={firstFieldError(fieldErrors, "bankName")}
        >
          <Input
            id="bankName"
            name="bankName"
            value={bankName}
            onChange={(event) => setBankName(event.target.value)}
          />
        </FormField>
      </div>

      <FormField
        id="paidAt"
        label="زمان واریز"
        error={firstFieldError(fieldErrors, "paidAt")}
        required
      >
        <Input
          id="paidAt"
          name="paidAt"
          type="datetime-local"
          className="ltr-nums"
          value={paidAt}
          onChange={(event) => setPaidAt(event.target.value)}
          required
        />
      </FormField>

      <FormField
        id="receiptFile"
        label="تصویر رسید"
        hint="JPG، PNG، WebP یا PDF تا ۸ مگابایت."
        error={firstFieldError(fieldErrors, "file") ?? firstFieldError(fieldErrors, "receiptFileId")}
        required
      >
        <Input
          id="receiptFile"
          name="receiptFile"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setUploadedFileId(null);
          }}
          required
        />
      </FormField>

      <FormField id="note" label="توضیح" hint="اختیاری" error={firstFieldError(fieldErrors, "note")}>
        <Textarea
          id="note"
          name="note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={300}
        />
      </FormField>

      {formError ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {formError}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? <Loader2Icon className="animate-spin" /> : <UploadIcon />}
        ثبت رسید
      </Button>
    </form>
  );
}
