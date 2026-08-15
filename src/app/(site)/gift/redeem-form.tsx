"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { redeemGiftCardAction } from "@/modules/gifting/actions/gifting.actions";
import { copy, cta } from "@/shared/config/copy";
import { toEnglishDigits } from "@/shared/lib/persian";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

export function RedeemGiftCardForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | undefined>();

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(undefined);
        startTransition(async () => {
          const result = await redeemGiftCardAction({ code: toEnglishDigits(code).trim() });
          if (!result.ok) {
            setError(result.error);
            toast.error(result.error);
            return;
          }
          toast.success("کارت هدیه تایید شد.");
          router.push(`/g/${result.data.token}`);
        });
      }}
    >
      <FormField id="giftCardCode" label={copy.gift.redeemLabel} required {...(error ? { error } : {})}>
        <Input
          id="giftCardCode"
          name="code"
          dir="ltr"
          className="text-start ltr-nums"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder={copy.gift.redeemPlaceholder}
          required
        />
      </FormField>
      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2Icon className="animate-spin" /> : null}
        {cta.redeemCard}
      </Button>
    </form>
  );
}
