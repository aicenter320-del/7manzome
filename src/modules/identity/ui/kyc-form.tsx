"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { BadgeCheckIcon, Loader2Icon } from "lucide-react";

import { toEnglishDigits } from "@/shared/lib/persian";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { JalaliDateInput } from "@/shared/ui/jalali-date-input";
import type { KycStatus } from "@/shared/types/enums";

import { submitKyc } from "../actions/user.actions";

/**
 * فرم احراز هویت کامل.
 *
 * توجه: این لایه از ورود جداست. کاربر بدون این هم می‌تواند خرید کند؛
 * این فرم فقط برای عملیات مالی خاص لازم است (ADR-0010).
 */
export function KycForm({
  status,
  rejectionReason,
  defaults,
}: {
  status: KycStatus;
  rejectionReason?: string | null;
  defaults?: { firstName?: string | null; lastName?: string | null };
}) {
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [birthDateAt, setBirthDateAt] = useState<number | null>(null);

  if (status === "verified") {
    return (
      <Alert variant="success">
        <BadgeCheckIcon />
        <AlertTitle>احراز هویت شما تایید شده است</AlertTitle>
        <AlertDescription>
          اطلاعات هویتی شما ثبت و تایید شده و همه امکانات حساب برای شما فعال است.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "pending") {
    return (
      <Alert variant="info">
        <AlertTitle>در انتظار بررسی</AlertTitle>
        <AlertDescription>
          اطلاعات شما ثبت شد و در حال بررسی است. نتیجه از طریق پیامک اطلاع داده می‌شود.
        </AlertDescription>
      </Alert>
    );
  }

  const handleSubmit = (formData: FormData) => {
    setFieldErrors({});
    setFormError(null);

    if (birthDateAt === null) {
      setFieldErrors({ birthDateAt: ["تاریخ تولد را انتخاب کنید"] });
      return;
    }

    startTransition(async () => {
      const result = await submitKyc({
        firstName: String(formData.get("firstName") ?? "").trim(),
        lastName: String(formData.get("lastName") ?? "").trim(),
        nationalId: toEnglishDigits(String(formData.get("nationalId") ?? "")),
        birthDateAt,
      });

      if (!result.ok) {
        setFormError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      toast.success("اطلاعات احراز هویت ثبت شد.");
    });
  };

  return (
    <form action={handleSubmit} className="grid gap-5">
      {status === "rejected" && rejectionReason ? (
        <Alert variant="destructive">
          <AlertTitle>احراز هویت شما تایید نشد</AlertTitle>
          <AlertDescription>{rejectionReason}</AlertDescription>
        </Alert>
      ) : null}

      {formError ? (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-5">
        <FormField
          id="firstName"
          label="نام"
          required
          {...(fieldErrors.firstName?.[0] ? { error: fieldErrors.firstName[0] } : {})}
        >
          <Input
            id="firstName"
            name="firstName"
            defaultValue={defaults?.firstName ?? ""}
            required
          />
        </FormField>

        <FormField
          id="lastName"
          label="نام خانوادگی"
          required
          {...(fieldErrors.lastName?.[0] ? { error: fieldErrors.lastName[0] } : {})}
        >
          <Input
            id="lastName"
            name="lastName"
            defaultValue={defaults?.lastName ?? ""}
            required
          />
        </FormField>
      </div>

      <FormField
        id="nationalId"
        label="کد ملی"
        hint="کد ملی ده‌رقمی بدون خط تیره"
        required
        {...(fieldErrors.nationalId?.[0] ? { error: fieldErrors.nationalId[0] } : {})}
      >
        <Input
          id="nationalId"
          name="nationalId"
          inputMode="numeric"
          maxLength={10}
          className="ltr-nums"
          required
        />
      </FormField>

      <FormField
        id="birthDateAt"
        label="تاریخ تولد"
        required
        {...(fieldErrors.birthDateAt?.[0] ? { error: fieldErrors.birthDateAt[0] } : {})}
      >
        <JalaliDateInput
          id="birthDateAt"
          value={birthDateAt}
          onChange={setBirthDateAt}
          minYear={1300}
        />
      </FormField>

      <Button type="submit" disabled={isPending} className="justify-self-start">
        {isPending ? <Loader2Icon className="animate-spin" /> : <BadgeCheckIcon />}
        ثبت اطلاعات احراز هویت
      </Button>
    </form>
  );
}
