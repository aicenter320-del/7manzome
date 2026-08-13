"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon, SaveIcon } from "lucide-react";

import { formatPhoneFa } from "@/shared/lib/persian";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

import { updateProfile } from "../actions/user.actions";
import type { PublicUser } from "../domain/types";

export function ProfileForm({ user }: { user: PublicUser }) {
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setFieldErrors({});
    setFormError(null);

    startTransition(async () => {
      const email = String(formData.get("email") ?? "").trim();

      const result = await updateProfile({
        firstName: String(formData.get("firstName") ?? "").trim(),
        lastName: String(formData.get("lastName") ?? "").trim(),
        ...(email ? { email } : {}),
      });

      if (!result.ok) {
        setFormError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      toast.success("اطلاعات شما ذخیره شد.");
    });
  };

  return (
    <form action={handleSubmit} className="grid gap-5">
      {formError ? (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <FormField id="phone" label="شماره موبایل" hint="شماره موبایل قابل تغییر نیست.">
        <Input
          id="phone"
          value={formatPhoneFa(user.phone)}
          className="ltr-nums"
          disabled
          readOnly
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="firstName"
          label="نام"
          required
          {...(fieldErrors.firstName?.[0] ? { error: fieldErrors.firstName[0] } : {})}
        >
          <Input id="firstName" name="firstName" defaultValue={user.firstName ?? ""} required />
        </FormField>

        <FormField
          id="lastName"
          label="نام خانوادگی"
          required
          {...(fieldErrors.lastName?.[0] ? { error: fieldErrors.lastName[0] } : {})}
        >
          <Input id="lastName" name="lastName" defaultValue={user.lastName ?? ""} required />
        </FormField>
      </div>

      <FormField
        id="email"
        label="ایمیل"
        hint="اختیاری است."
        {...(fieldErrors.email?.[0] ? { error: fieldErrors.email[0] } : {})}
      >
        <Input id="email" name="email" type="email" dir="ltr" className="text-start" />
      </FormField>

      <Button type="submit" disabled={isPending} className="justify-self-start">
        {isPending ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
        ذخیره تغییرات
      </Button>
    </form>
  );
}
