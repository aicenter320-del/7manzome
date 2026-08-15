"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { recordGoldCoverAction } from "@/modules/treasury/actions/treasure.actions";
import { MG_PER_GRAM } from "@/shared/lib/gold";
import { parseTomanInput } from "@/shared/lib/money";
import { toEnglishDigits } from "@/shared/lib/persian";
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

export function RecordGoldCoverForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [karat, setKarat] = useState<"18" | "24">("18");
  const [purchasedAt, setPurchasedAt] = useState<number | null>(() => Date.now());

  return (
    <form
      className="glass grid gap-4 rounded-3xl p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        const form = new FormData(event.currentTarget);
        const amountMg = Number(toEnglishDigits(String(form.get("amountMg") ?? "")));
        const paidRaw = String(form.get("paidToman") ?? "").trim();
        const note = String(form.get("note") ?? "").trim();

        if (purchasedAt === null) {
          setError("تاریخ خرید را انتخاب کنید.");
          return;
        }

        let paidRial: number | undefined;
        if (paidRaw) {
          const parsed = parseTomanInput(paidRaw);
          if (parsed === null) {
            setError("مبلغ را به تومان وارد کنید.");
            return;
          }
          paidRial = parsed;
        }

        startTransition(async () => {
          const result = await recordGoldCoverAction({
            amountMg,
            karat: karat === "24" ? 24 : 18,
            purchasedAt,
            ...(paidRial !== undefined ? { paidRial } : {}),
            ...(note ? { note } : {}),
          });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          toast.success("خرید پوشش طلا ثبت شد.");
          router.refresh();
        });
      }}
    >
      <h2 className="font-semibold">ثبت خرید طلای پوشش</h2>
      <p className="text-sm text-muted-foreground">
        این خرید موجودی گنجینهٔ کودک را تغییر نمی‌دهد؛ فقط پشتوانهٔ فروشگاه را ثبت می‌کند.
      </p>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <FormField id="amountMg" label="وزن (میلی‌گرم)" hint={`هر گرم = ${MG_PER_GRAM} میلی‌گرم`} required>
        <Input
          id="amountMg"
          name="amountMg"
          inputMode="numeric"
          className="ltr-nums"
          dir="ltr"
          required
        />
      </FormField>
      <FormField id="karat" label="عیار">
        <Select value={karat} onValueChange={(value) => setKarat(value as "18" | "24")}>
          <SelectTrigger id="karat">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="18">۱۸ عیار</SelectItem>
            <SelectItem value="24">۲۴ عیار</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      <FormField id="paidToman" label="مبلغ پرداختی (تومان)" hint="اختیاری.">
        <Input id="paidToman" name="paidToman" inputMode="numeric" className="ltr-nums" dir="ltr" />
      </FormField>
      <FormField id="purchasedAt" label="تاریخ خرید" required>
        <JalaliDateInput id="purchasedAt" value={purchasedAt} onChange={setPurchasedAt} />
      </FormField>
      <FormField id="note" label="یادداشت" hint="اختیاری.">
        <Input id="note" name="note" />
      </FormField>
      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2Icon className="animate-spin" /> : null}
        ثبت خرید
      </Button>
    </form>
  );
}
