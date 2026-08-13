"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { formatRial, parseTomanInput } from "@/shared/lib/money";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

import { startContributionAction } from "../actions/gifting.actions";

/**
 * فرم مشارکت مهمان. مبلغ را به تومان می‌گیرد و به ریال برای سرور می‌فرستد.
 */
export function ContributionForm({
  token,
  suggestedAmountsRial,
  childFirstName,
}: {
  token: string;
  suggestedAmountsRial: number[];
  childFirstName: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedRial, setSelectedRial] = useState<number | null>(
    suggestedAmountsRial[0] ?? null,
  );
  const [customToman, setCustomToman] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = (formData: FormData) => {
    setFieldErrors({});
    setFormError(null);

    const customRial = customToman.trim() ? parseTomanInput(customToman) : null;
    const amountRial = customRial ?? selectedRial;

    if (amountRial === null || amountRial <= 0) {
      setFieldErrors({ amountRial: ["مبلغ مشارکت را انتخاب یا وارد کنید."] });
      return;
    }

    if (customToman.trim() && customRial === null) {
      setFieldErrors({ amountRial: ["مبلغ واردشده معتبر نیست."] });
      return;
    }

    const contributorName = String(formData.get("contributorName") ?? "").trim();
    const contributorPhone = String(formData.get("contributorPhone") ?? "").trim();
    const relationLabel = String(formData.get("relationLabel") ?? "").trim();
    const keepsakeMessage = String(formData.get("keepsakeMessage") ?? "").trim();

    startTransition(async () => {
      const result = await startContributionAction({
        token,
        contributorName,
        ...(contributorPhone ? { contributorPhone } : {}),
        ...(relationLabel ? { relationLabel } : {}),
        amountRial,
        ...(keepsakeMessage ? { keepsakeMessage } : {}),
        isAnonymous,
      });

      if (!result.ok) {
        setFormError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      toast.success("در حال انتقال به صفحه پرداخت…");
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

      <FormField
        id="amountRial"
        label="مبلغ هدیه"
        required
        hint="طلا پس از تایید پرداخت، با قیمت همان لحظه به گنجینه اضافه می‌شود."
        {...(fieldErrors.amountRial?.[0] ? { error: fieldErrors.amountRial[0] } : {})}
      >
        <div className="flex flex-wrap gap-2">
          {suggestedAmountsRial.map((amount) => {
            const selected = selectedRial === amount && customToman.trim() === "";
            return (
              <Button
                key={amount}
                type="button"
                variant={selected ? "gold" : "outline"}
                onClick={() => {
                  setSelectedRial(amount);
                  setCustomToman("");
                }}
              >
                {formatRial(amount)}
              </Button>
            );
          })}
        </div>
        <Input
          id="amountRial"
          name="customAmountToman"
          inputMode="numeric"
          dir="ltr"
          className="mt-3 text-start"
          placeholder="مبلغ دلخواه به تومان"
          value={customToman}
          onChange={(event) => {
            setCustomToman(event.target.value);
            setSelectedRial(null);
          }}
        />
      </FormField>

      <FormField
        id="contributorName"
        label="نام شما"
        required
        {...(fieldErrors.contributorName?.[0] ? { error: fieldErrors.contributorName[0] } : {})}
      >
        <Input
          id="contributorName"
          name="contributorName"
          placeholder="مثلاً خاله سارا"
          required
        />
      </FormField>

      <FormField
        id="contributorPhone"
        label="شماره موبایل"
        hint="اختیاری است؛ برای پیگیری پرداخت."
        {...(fieldErrors.contributorPhone?.[0] ? { error: fieldErrors.contributorPhone[0] } : {})}
      >
        <Input
          id="contributorPhone"
          name="contributorPhone"
          inputMode="tel"
          dir="ltr"
          className="text-start"
          placeholder="0912…"
        />
      </FormField>

      <FormField
        id="relationLabel"
        label="نسبت شما با کودک"
        hint="مثلاً خاله، دوست مامان. اختیاری است."
        {...(fieldErrors.relationLabel?.[0] ? { error: fieldErrors.relationLabel[0] } : {})}
      >
        <Input id="relationLabel" name="relationLabel" placeholder="خاله" />
      </FormField>

      <FormField
        id="keepsakeMessage"
        label={`پیام یادگاری برای ${childFirstName}`}
        hint="این پیام در گنجینه می‌ماند. حداکثر ۳۰۰ حرف."
        {...(fieldErrors.keepsakeMessage?.[0] ? { error: fieldErrors.keepsakeMessage[0] } : {})}
      >
        <Textarea id="keepsakeMessage" name="keepsakeMessage" rows={4} maxLength={300} />
      </FormField>

      <div className="flex items-center gap-2">
        <Checkbox
          id="isAnonymous"
          checked={isAnonymous}
          onCheckedChange={(value) => setIsAnonymous(value === true)}
        />
        <Label htmlFor="isAnonymous" className="font-normal">
          پیام من برای مهمان‌های دیگر بدون نام نمایش داده شود
        </Label>
      </div>

      <Button type="submit" disabled={isPending} className="justify-self-start">
        {isPending ? <Loader2Icon className="animate-spin" /> : null}
        ادامه به پرداخت
      </Button>
    </form>
  );
}
