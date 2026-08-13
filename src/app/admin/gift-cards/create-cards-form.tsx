"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { createGiftCardsAction } from "@/modules/gifting/actions/gifting.actions";
import { toEnglishDigits } from "@/shared/lib/persian";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

export function CreateGiftCardsForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [codes, setCodes] = useState<string[]>([]);

  return (
    <form
      className="grid gap-4 rounded-xl border border-border bg-card p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        const form = new FormData(event.currentTarget);
        const count = Number(toEnglishDigits(String(form.get("count") ?? "1")));
        const design = String(form.get("design") ?? "").trim();

        startTransition(async () => {
          const result = await createGiftCardsAction({
            count,
            ...(design ? { design } : {}),
          });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setCodes(result.data.codes);
          toast.success("کارت‌ها ساخته شد.");
          router.refresh();
        });
      }}
    >
      <h2 className="font-semibold">ساخت کارت هدیه</h2>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <FormField id="count" label="تعداد" required>
        <Input id="count" name="count" inputMode="numeric" className="ltr-nums" dir="ltr" defaultValue="5" required />
      </FormField>
      <FormField id="design" label="طرح" hint="اختیاری.">
        <Input id="design" name="design" />
      </FormField>
      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2Icon className="animate-spin" /> : null}
        ساخت کارت
      </Button>
      {codes.length > 0 ? (
        <ul className="ltr-nums grid gap-1 text-sm text-start">
          {codes.map((code) => (
            <li key={code}>{code}</li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}
