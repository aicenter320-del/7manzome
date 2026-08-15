"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon, UploadIcon } from "lucide-react";

import { IRAN_BANK_NAMES } from "@/shared/data/iran-banks";
import { toEnglishDigits } from "@/shared/lib/persian";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { JalaliDateInput } from "@/shared/ui/jalali-date-input";
import { Money } from "@/shared/ui/money";
import { SearchSelect } from "@/shared/ui/search-select";
import { Textarea } from "@/shared/ui/textarea";

import { submitReceiptAction, uploadPaymentReceipt } from "../actions/payment.actions";

const BANK_ALIASES = ["بانک"] as const;
const BANK_OPTIONS = IRAN_BANK_NAMES.map((name) => ({
  value: name,
  label: name,
  keywords: [`بانک ${name}`],
}));

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
  expectedAmountRial: number;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [referenceNumber, setReferenceNumber] = useState("");
  const [payerName, setPayerName] = useState("");
  const [payerCardLast4, setPayerCardLast4] = useState("");
  const [bankName, setBankName] = useState("");
  const [paidAt, setPaidAt] = useState<number | null>(() => Date.now());
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const submit = () => {
    setFormError(null);
    setFieldErrors({});

    if (!file && !uploadedFileId) {
      setFieldErrors({ receiptFileId: ["عکس رسید را انتخاب کنید"] });
      return;
    }

    if (!bankName) {
      setFieldErrors({ bankName: ["بانک واریزکننده را انتخاب کنید"] });
      return;
    }

    if (paidAt === null) {
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

      if (!receiptFileId) {
        setFieldErrors({ receiptFileId: ["عکس رسید را انتخاب کنید"] });
        return;
      }

      const last4 = toEnglishDigits(payerCardLast4).replace(/\D/g, "");

      const result = await submitReceiptAction({
        paymentId,
        referenceNumber,
        paidAmountRial: expectedAmountRial,
        payerName,
        ...(last4 ? { payerCardLast4: last4 } : {}),
        bankName,
        paidAt,
        ...(note.trim() ? { note: note.trim() } : {}),
        receiptFileId,
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
      <FormField id="paidAmount" label="مبلغ واریزی" hint="مبلغ سفارش قفل شده و عوض نمی‌شود.">
        <p className="text-lg font-semibold text-gold-deep">
          <Money rial={expectedAmountRial} />
        </p>
      </FormField>

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

      <FormField
        id="bankName"
        label="بانک واریزکننده"
        error={firstFieldError(fieldErrors, "bankName")}
        required
      >
        <SearchSelect
          id="bankName"
          value={bankName}
          placeholder="نام بانک را بنویسید یا انتخاب کنید"
          queryAliases={BANK_ALIASES}
          options={BANK_OPTIONS}
          onChange={setBankName}
        />
      </FormField>

      <FormField
        id="paidAt"
        label="تاریخ واریز"
        error={firstFieldError(fieldErrors, "paidAt")}
        required
      >
        <JalaliDateInput
          id="paidAt"
          value={paidAt}
          withTime
          timeLabel="ساعت واریز"
          onChange={setPaidAt}
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

      <Accordion type="single" collapsible>
        <AccordionItem value="extra">
          <AccordionTrigger>جزئیات بیشتر</AccordionTrigger>
          <AccordionContent className="grid gap-5 text-foreground">
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

            <FormField id="note" label="توضیح" hint="اختیاری" error={firstFieldError(fieldErrors, "note")}>
              <Textarea
                id="note"
                name="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={300}
              />
            </FormField>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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
