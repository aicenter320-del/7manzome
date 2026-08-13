"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { setManualGoldPrice } from "@/modules/pricing/actions/gold-price.actions";
import { parseTomanInput } from "@/shared/lib/money";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

export function SetGoldPriceForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [karat, setKarat] = useState<"18" | "24">("18");
  const [toman, setToman] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="grid gap-4 rounded-xl border border-border bg-card p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        const pricePerGramRial = parseTomanInput(toman);
        if (pricePerGramRial === null) {
          setError("قیمت هر گرم را به تومان وارد کنید.");
          return;
        }

        startTransition(async () => {
          const result = await setManualGoldPrice({
            karat: karat === "24" ? 24 : 18,
            pricePerGramRial,
            ...(note.trim() ? { note: note.trim() } : {}),
          });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          toast.success("قیمت طلا ثبت شد.");
          setToman("");
          router.refresh();
        });
      }}
    >
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

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

      <FormField id="priceToman" label="قیمت هر گرم (تومان)" required>
        <Input
          id="priceToman"
          value={toman}
          onChange={(event) => setToman(event.target.value)}
          inputMode="numeric"
          className="ltr-nums"
          dir="ltr"
          required
        />
      </FormField>

      <FormField id="priceNote" label="یادداشت" hint="اختیاری.">
        <Input id="priceNote" value={note} onChange={(event) => setNote(event.target.value)} />
      </FormField>

      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2Icon className="animate-spin" /> : null}
        ثبت قیمت
      </Button>
    </form>
  );
}
