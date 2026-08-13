"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { updateSetting } from "@/modules/content/actions/content.actions";
import type { SettingKey, SettingValue } from "@/modules/content/domain/settings-keys";
import { toEnglishDigits } from "@/shared/lib/persian";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";

export function SettingsEditor({
  items,
}: {
  items: Array<{ key: SettingKey; label: string; value: SettingValue<SettingKey> }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const item of items) {
      initial[item.key] =
        typeof item.value === "string"
          ? item.value
          : Array.isArray(item.value) || typeof item.value === "object"
            ? JSON.stringify(item.value)
            : String(item.value);
    }
    return initial;
  });

  const save = (key: SettingKey, parsed: unknown) => {
    startTransition(async () => {
      const result = await updateSetting({ key, value: parsed });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("تنظیم ذخیره شد.");
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6">
      {items.map((item) => {
        const current = item.value;
        if (typeof current === "boolean") {
          return (
            <FormField key={item.key} id={item.key} label={item.label}>
              <Switch
                id={item.key}
                checked={values[item.key] === "true"}
                onCheckedChange={(checked) => {
                  setValues((prev) => ({ ...prev, [item.key]: String(checked) }));
                  save(item.key, checked);
                }}
                disabled={isPending}
              />
            </FormField>
          );
        }

        if (typeof current === "string" && current.length > 40) {
          return (
            <form
              key={item.key}
              className="grid gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                save(item.key, values[item.key] ?? "");
              }}
            >
              <FormField id={item.key} label={item.label}>
                <Textarea
                  id={item.key}
                  value={values[item.key] ?? ""}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, [item.key]: event.target.value }))
                  }
                  rows={3}
                />
              </FormField>
              <Button type="submit" size="sm" disabled={isPending} className="justify-self-start">
                {isPending ? <Loader2Icon className="animate-spin" /> : null}
                ذخیره
              </Button>
            </form>
          );
        }

        return (
          <form
            key={item.key}
            className="grid gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const raw = values[item.key] ?? "";
              if (typeof current === "number") {
                const parsed = Number(toEnglishDigits(raw));
                if (!Number.isInteger(parsed)) {
                  toast.error("عدد صحیح وارد کنید.");
                  return;
                }
                save(item.key, parsed);
                return;
              }
              if (Array.isArray(current)) {
                try {
                  save(item.key, JSON.parse(raw) as unknown);
                } catch {
                  toast.error("آرایه را به‌صورت JSON معتبر وارد کنید.");
                }
                return;
              }
              save(item.key, raw);
            }}
          >
            <FormField id={item.key} label={item.label} hint={item.key}>
              <Input
                id={item.key}
                value={values[item.key] ?? ""}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, [item.key]: event.target.value }))
                }
                className={typeof current === "number" || Array.isArray(current) ? "ltr-nums text-start" : undefined}
                dir={typeof current === "number" || Array.isArray(current) ? "ltr" : undefined}
              />
            </FormField>
            <Button type="submit" size="sm" disabled={isPending} className="justify-self-start">
              ذخیره
            </Button>
          </form>
        );
      })}
    </div>
  );
}
