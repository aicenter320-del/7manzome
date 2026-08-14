"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon, SaveIcon } from "lucide-react";

import {
  adminArchiveChild,
  adminUpdateChild,
} from "@/modules/admin/actions/admin.actions";
import type { ChildSummary } from "@/modules/children/domain/types";
import { formatJalaliDate } from "@/shared/lib/jalali";
import { CHILD_GENDER_LABELS, CHILD_GENDERS, type ChildGender } from "@/shared/types/enums";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
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

import { ConfirmActionButton } from "./confirm-action-button";

export function AdminChildrenPanel({
  userId,
  profiles,
  canWrite,
}: {
  userId: string;
  profiles: ChildSummary[];
  canWrite: boolean;
}) {
  if (profiles.length === 0) {
    return <EmptyState title="کودکی ثبت نشده" />;
  }

  return (
    <div className="grid gap-6">
      {profiles.map((child) => (
        <AdminChildCard key={child.id} userId={userId} child={child} canWrite={canWrite} />
      ))}
    </div>
  );
}

function AdminChildCard({
  userId,
  child,
  canWrite,
}: {
  userId: string;
  child: ChildSummary;
  canWrite: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [birthDateAt, setBirthDateAt] = useState<number | null>(child.birthDateAt);
  const [gender, setGender] = useState<ChildGender>(child.gender);
  const prefix = `child-${child.id}`;

  const handleSubmit = (formData: FormData) => {
    setFieldErrors({});
    setFormError(null);

    if (birthDateAt === null) {
      setFieldErrors({ birthDateAt: ["تاریخ تولد کودک را انتخاب کنید"] });
      return;
    }

    startTransition(async () => {
      const result = await adminUpdateChild({
        userId,
        childId: child.id,
        firstName: String(formData.get("firstName") ?? "").trim(),
        lastName: String(formData.get("lastName") ?? "").trim() || null,
        nameEn: String(formData.get("nameEn") ?? "").trim() || null,
        gender,
        birthDateAt,
        note: String(formData.get("note") ?? "").trim() || null,
      });

      if (!result.ok) {
        setFormError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      toast.success("پروفایل کودک به‌روز شد.");
      router.refresh();
    });
  };

  return (
    <section className="grid gap-4 rounded-2xl glass p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-medium">{child.displayName}</h3>
          <p className="text-sm text-muted-foreground">{child.ageLabel}</p>
        </div>
        {child.archivedAt ? <Badge variant="muted">بایگانی‌شده</Badge> : null}
      </div>

      <form action={handleSubmit} className="grid gap-4">
        {formError ? (
          <Alert variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id={`${prefix}-firstName`}
            label="نام کودک"
            required
            {...(fieldErrors.firstName?.[0] ? { error: fieldErrors.firstName[0] } : {})}
          >
            <Input
              id={`${prefix}-firstName`}
              name="firstName"
              defaultValue={child.firstName}
              required
              disabled={!canWrite}
            />
          </FormField>
          <FormField id={`${prefix}-lastName`} label="نام خانوادگی">
            <Input
              id={`${prefix}-lastName`}
              name="lastName"
              defaultValue={child.lastName ?? ""}
              disabled={!canWrite}
            />
          </FormField>
        </div>

        <FormField id={`${prefix}-nameEn`} label="نام لاتین">
          <Input
            id={`${prefix}-nameEn`}
            name="nameEn"
            defaultValue={child.nameEn ?? ""}
            disabled={!canWrite}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id={`${prefix}-gender`} label="جنسیت">
            <Select
              value={gender}
              onValueChange={(value) => setGender(value as ChildGender)}
              disabled={!canWrite}
            >
              <SelectTrigger id={`${prefix}-gender`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHILD_GENDERS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {CHILD_GENDER_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            id={`${prefix}-birthDate`}
            label="تاریخ تولد"
            required
            {...(fieldErrors.birthDateAt?.[0] ? { error: fieldErrors.birthDateAt[0] } : {})}
          >
            {canWrite ? (
              <JalaliDateInput
                id={`${prefix}-birthDate`}
                value={birthDateAt}
                onChange={setBirthDateAt}
              />
            ) : (
              <p>{formatJalaliDate(child.birthDateAt)}</p>
            )}
          </FormField>
        </div>

        <FormField id={`${prefix}-note`} label="یادداشت">
          <Textarea
            id={`${prefix}-note`}
            name="note"
            defaultValue={child.note ?? ""}
            disabled={!canWrite}
          />
        </FormField>

        {canWrite ? (
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
              ذخیره
            </Button>
            {child.archivedAt ? null : (
              <ConfirmActionButton
                label="بایگانی"
                title="بایگانی پروفایل کودک"
                description={`پروفایل «${child.displayName}» بایگانی شود؟ ردیف حذف نمی‌شود.`}
                variant="destructive"
                onConfirm={() => adminArchiveChild({ userId, childId: child.id })}
              />
            )}
          </div>
        ) : null}
      </form>
    </section>
  );
}
