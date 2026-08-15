"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { copy, cta } from "@/shared/config/copy";
import { toEnglishDigits } from "@/shared/lib/persian";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

import { placeOrderAction } from "../actions/order.actions";
import { IranPlaceFields } from "./iran-place-fields";

export function CheckoutForm({
  defaultRecipientName,
  defaultRecipientPhone,
  treasureId,
}: {
  defaultRecipientName?: string;
  defaultRecipientPhone?: string;
  treasureId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const hideName = Boolean(defaultRecipientName);
  const hidePhone = Boolean(defaultRecipientPhone);

  const handleSubmit = (formData: FormData) => {
    setFieldErrors({});
    setFormError(null);

    const postalCodeRaw = String(formData.get("postalCode") ?? "").trim();
    const plate = String(formData.get("plate") ?? "").trim();
    const unit = String(formData.get("unit") ?? "").trim();
    const customerNote = String(formData.get("customerNote") ?? "").trim();

    startTransition(async () => {
      const result = await placeOrderAction({
        recipientName: String(formData.get("recipientName") ?? "").trim(),
        recipientPhone: toEnglishDigits(String(formData.get("recipientPhone") ?? "")),
        shippingAddress: {
          province: String(formData.get("province") ?? "").trim(),
          city: String(formData.get("city") ?? "").trim(),
          addressLine: String(formData.get("addressLine") ?? "").trim(),
          ...(postalCodeRaw ? { postalCode: toEnglishDigits(postalCodeRaw) } : {}),
          ...(plate ? { plate } : {}),
          ...(unit ? { unit } : {}),
        },
        ...(customerNote ? { customerNote } : {}),
        ...(treasureId ? { treasureId } : {}),
      });

      if (!result.ok) {
        setFormError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      toast.success("سفارش شما ثبت شد. به صفحه پرداخت منتقل می‌شوید.");
      router.push(result.data.nextUrl);
    });
  };

  return (
    <form action={handleSubmit} className="grid gap-5">
      {formError ? (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      {hideName || hidePhone ? (
        <div className="grid gap-1 text-sm text-muted-foreground">
          {hideName ? <input type="hidden" name="recipientName" value={defaultRecipientName} /> : null}
          {hidePhone ? (
            <input type="hidden" name="recipientPhone" value={defaultRecipientPhone} />
          ) : null}
          <p>
            {copy.checkout.recipientFromAccount}
            {hideName ? ` — ${defaultRecipientName}` : null}
            {hidePhone ? ` — ${defaultRecipientPhone}` : null}
          </p>
        </div>
      ) : null}

      {hideName ? null : (
        <FormField
          id="recipientName"
          label="نام گیرنده"
          required
          {...(fieldErrors.recipientName?.[0] ? { error: fieldErrors.recipientName[0] } : {})}
        >
          <Input id="recipientName" name="recipientName" required />
        </FormField>
      )}

      {hidePhone ? null : (
        <FormField
          id="recipientPhone"
          label="شماره موبایل گیرنده"
          required
          {...(fieldErrors.recipientPhone?.[0] ? { error: fieldErrors.recipientPhone[0] } : {})}
        >
          <Input
            id="recipientPhone"
            name="recipientPhone"
            inputMode="tel"
            dir="ltr"
            className="ltr-nums text-start"
            placeholder="09121234567"
            required
          />
        </FormField>
      )}

      <IranPlaceFields
        {...(fieldErrors["shippingAddress.province"]?.[0]
          ? { provinceError: fieldErrors["shippingAddress.province"][0] }
          : {})}
        {...(fieldErrors["shippingAddress.city"]?.[0]
          ? { cityError: fieldErrors["shippingAddress.city"][0] }
          : {})}
      />

      <FormField
        id="addressLine"
        label="نشانی"
        required
        {...(fieldErrors["shippingAddress.addressLine"]?.[0]
          ? { error: fieldErrors["shippingAddress.addressLine"][0] }
          : {})}
      >
        <Textarea id="addressLine" name="addressLine" rows={3} required />
      </FormField>

      <Accordion type="single" collapsible>
        <AccordionItem value="more">
          <AccordionTrigger>{copy.checkout.moreDetails}</AccordionTrigger>
          <AccordionContent className="grid gap-5 text-foreground">
            <div className="grid gap-5 sm:grid-cols-3">
              <FormField
                id="postalCode"
                label="کد پستی"
                hint="اختیاری؛ ۱۰ رقم."
                {...(fieldErrors["shippingAddress.postalCode"]?.[0]
                  ? { error: fieldErrors["shippingAddress.postalCode"][0] }
                  : {})}
              >
                <Input
                  id="postalCode"
                  name="postalCode"
                  inputMode="numeric"
                  dir="ltr"
                  className="ltr-nums text-start"
                  maxLength={10}
                />
              </FormField>

              <FormField id="plate" label="پلاک" hint="اختیاری.">
                <Input id="plate" name="plate" />
              </FormField>

              <FormField id="unit" label="واحد" hint="اختیاری.">
                <Input id="unit" name="unit" />
              </FormField>
            </div>

            <FormField
              id="customerNote"
              label="یادداشت سفارش"
              hint="اختیاری؛ روی بسته نوشته نمی‌شود."
              {...(fieldErrors.customerNote?.[0] ? { error: fieldErrors.customerNote[0] } : {})}
            >
              <Textarea id="customerNote" name="customerNote" rows={3} />
            </FormField>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button type="submit" disabled={isPending} className="justify-self-start">
        {isPending ? <Loader2Icon className="animate-spin" /> : null}
        {cta.checkout}
      </Button>
    </form>
  );
}
