"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon, SaveIcon } from "lucide-react";

import { CHILD_GENDER_LABELS, GUARDIAN_RELATION_LABELS } from "@/shared/types/enums";
import type { ChildGender, GuardianRelation } from "@/shared/types/enums";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { JalaliDateInput } from "@/shared/ui/jalali-date-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

import { createChildProfile, updateChildProfile } from "../actions/child.actions";
import type { ChildSummary } from "../domain/types";

/**
 * فرم ساخت و ویرایش پروفایل کودک.
 *
 * تاریخ تولد اجباری است چون کل موتور مناسبت و پیشنهاد هدیه به آن وابسته است.
 */
export function ChildForm({
  child,
  defaultRelation = "mother",
}: {
  child?: ChildSummary;
  defaultRelation?: GuardianRelation;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [birthDateAt, setBirthDateAt] = useState<number | null>(child?.birthDateAt ?? null);
  const [gender, setGender] = useState<ChildGender>(child?.gender ?? "unspecified");
  const [relation, setRelation] = useState<GuardianRelation>(defaultRelation);

  const isEdit = Boolean(child);

  const handleSubmit = (formData: FormData) => {
    setFieldErrors({});
    setFormError(null);

    if (birthDateAt === null) {
      setFieldErrors({ birthDateAt: ["تاریخ تولد کودک را انتخاب کنید"] });
      return;
    }

    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const nameEn = String(formData.get("nameEn") ?? "").trim();
    const note = String(formData.get("note") ?? "").trim();

    startTransition(async () => {
      const result = isEdit
        ? await updateChildProfile({
            childId: child!.id,
            firstName,
            lastName: lastName || null,
            nameEn: nameEn || null,
            gender,
            birthDateAt,
            note: note || null,
          })
        : await createChildProfile({
            firstName,
            ...(lastName ? { lastName } : {}),
            ...(nameEn ? { nameEn } : {}),
            gender,
            birthDateAt,
            ...(note ? { note } : {}),
            relation,
          });

      if (!result.ok) {
        setFormError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      toast.success(isEdit ? "پروفایل کودک به‌روز شد." : "پروفایل کودک ساخته شد.");
      router.push("/dashboard/children");
      router.refresh();
    });
  };

  return (
    <form action={handleSubmit} className="grid gap-5">
      {formError ? (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="firstName"
          label="نام کودک"
          required
          {...(fieldErrors.firstName?.[0] ? { error: fieldErrors.firstName[0] } : {})}
        >
          <Input
            id="firstName"
            name="firstName"
            defaultValue={child?.firstName ?? ""}
            placeholder="آراد"
            required
          />
        </FormField>

        <FormField
          id="lastName"
          label="نام خانوادگی"
          hint="اختیاری است."
          {...(fieldErrors.lastName?.[0] ? { error: fieldErrors.lastName[0] } : {})}
        >
          <Input id="lastName" name="lastName" defaultValue={child?.lastName ?? ""} />
        </FormField>
      </div>

      <FormField
        id="nameEn"
        label="نام لاتین"
        hint="برای حکاکی روی محصولات شخصی‌سازی‌شده استفاده می‌شود."
        {...(fieldErrors.nameEn?.[0] ? { error: fieldErrors.nameEn[0] } : {})}
      >
        <Input
          id="nameEn"
          name="nameEn"
          dir="ltr"
          className="text-start"
          placeholder="ARAD"
          defaultValue={child?.nameEn ?? ""}
        />
      </FormField>

      <FormField
        id="birthDateAt"
        label="تاریخ تولد"
        hint="برای محاسبه سن و پیشنهاد هدیه مناسب استفاده می‌شود."
        required
        {...(fieldErrors.birthDateAt?.[0] ? { error: fieldErrors.birthDateAt[0] } : {})}
      >
        {/* بازه پیش‌فرض بیست سال گذشته است که برای پروفایل کودک مناسب است. */}
        <JalaliDateInput id="birthDateAt" value={birthDateAt} onChange={setBirthDateAt} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="gender" label="جنسیت">
          <Select value={gender} onValueChange={(value) => setGender(value as ChildGender)}>
            <SelectTrigger id="gender">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CHILD_GENDER_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        {!isEdit ? (
          <FormField id="relation" label="نسبت شما با کودک" required>
            <Select
              value={relation}
              onValueChange={(value) => setRelation(value as GuardianRelation)}
            >
              <SelectTrigger id="relation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GUARDIAN_RELATION_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        ) : null}
      </div>

      <FormField id="note" label="یادداشت" hint="اختیاری؛ فقط برای خودتان قابل مشاهده است.">
        <Textarea id="note" name="note" defaultValue={child?.note ?? ""} rows={3} />
      </FormField>

      <Button type="submit" disabled={isPending} className="justify-self-start">
        {isPending ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
        {isEdit ? "ذخیره تغییرات" : "ساخت پروفایل کودک"}
      </Button>
    </form>
  );
}
