"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import {
  createStaffRoleAction,
  updateStaffRoleAction,
} from "@/modules/identity/actions/staff-role.actions";
import { completeGrants } from "@/modules/identity/domain/access-matrix";
import type { SectionGrant } from "@/modules/identity/domain/access-matrix";
import {
  ACCESS_SECTION_LABELS,
  ACCESS_SECTIONS,
  PANEL_ACCESS_LEVEL_LABELS,
  PANEL_ACCESS_LEVELS,
  type AccessSection,
  type PanelAccessLevel,
} from "@/shared/types/enums";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { Textarea } from "@/shared/ui/textarea";

export function StaffRoleForm({
  roleId,
  initialTitle,
  initialDescription,
  initialGrants,
}: {
  roleId?: string;
  initialTitle?: string;
  initialDescription?: string | null;
  initialGrants?: readonly SectionGrant[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(initialTitle ?? "");
  const [description, setDescription] = useState(initialDescription ?? "");
  const [levels, setLevels] = useState<Record<AccessSection, PanelAccessLevel>>(() =>
    completeGrants(initialGrants ?? []),
  );
  const [error, setError] = useState<string | null>(null);

  const grants = useMemo(
    () => ACCESS_SECTIONS.map((section) => ({ section, level: levels[section] })),
    [levels],
  );

  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        startTransition(async () => {
          const payload = {
            title: title.trim(),
            description: description.trim() || undefined,
            grants,
          };
          const result = roleId
            ? await updateStaffRoleAction({ ...payload, roleId })
            : await createStaffRoleAction(payload);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          toast.success(roleId ? "نقش ذخیره شد." : "نقش ساخته شد.");
          router.push("/admin/roles");
          router.refresh();
        });
      }}
    >
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <FormField id="roleTitle" label="عنوان نقش" required>
        <Input
          id="roleTitle"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </FormField>

      <FormField id="roleDescription" label="توضیح" hint="اختیاری.">
        <Textarea
          id="roleDescription"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </FormField>

      <fieldset className="grid gap-4">
        <legend className="text-sm font-medium">سطح دسترسی بخش‌ها</legend>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b border-border text-start">
                <th className="py-2 pe-3 font-medium">بخش</th>
                {PANEL_ACCESS_LEVELS.map((level) => (
                  <th key={level} className="px-2 py-2 font-medium">
                    {PANEL_ACCESS_LEVEL_LABELS[level]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ACCESS_SECTIONS.map((section) => (
                <tr key={section} className="border-b border-border/60">
                  <td className="py-3 pe-3">{ACCESS_SECTION_LABELS[section]}</td>
                  <td colSpan={PANEL_ACCESS_LEVELS.length} className="py-3">
                    <RadioGroup
                      className="grid grid-cols-4 gap-2"
                      value={levels[section]}
                      onValueChange={(value) => {
                        setLevels((current) => ({
                          ...current,
                          [section]: value as PanelAccessLevel,
                        }));
                      }}
                    >
                      {PANEL_ACCESS_LEVELS.map((level) => {
                        const id = `${section}-${level}`;
                        return (
                          <Label
                            key={level}
                            htmlFor={id}
                            className="flex cursor-pointer items-center justify-center gap-2"
                          >
                            <RadioGroupItem id={id} value={level} />
                            <span className="sr-only">{PANEL_ACCESS_LEVEL_LABELS[level]}</span>
                          </Label>
                        );
                      })}
                    </RadioGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </fieldset>

      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2Icon className="animate-spin" /> : null}
        {roleId ? "ذخیره نقش" : "ساخت نقش"}
      </Button>
    </form>
  );
}
