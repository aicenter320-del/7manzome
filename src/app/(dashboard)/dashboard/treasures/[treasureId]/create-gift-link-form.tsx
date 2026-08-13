"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { createGiftLinkAction } from "@/modules/gifting/actions/gifting.actions";
import { GiftShareBar } from "@/modules/gifting/ui/gift-share-bar";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

export function CreateGiftLinkForm({
  treasureId,
  defaultTitle,
}: {
  treasureId: string;
  defaultTitle: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);

  if (createdUrl) {
    return (
      <div className="grid gap-3">
        <p className="text-sm text-muted-foreground">لینک هدیه ساخته شد. آن را با خانواده به اشتراک بگذارید.</p>
        <GiftShareBar url={createdUrl} />
      </div>
    );
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setFormError(null);
        const form = new FormData(event.currentTarget);
        const title = String(form.get("title") ?? "").trim();
        const message = String(form.get("message") ?? "").trim();

        startTransition(async () => {
          const result = await createGiftLinkAction({
            treasureId,
            title,
            ...(message ? { message } : {}),
          });
          if (!result.ok) {
            setFormError(result.error);
            return;
          }
          toast.success("لینک هدیه ساخته شد.");
          setCreatedUrl(result.data.url);
          router.refresh();
        });
      }}
    >
      {formError ? (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <FormField id="giftLinkTitle" label="عنوان لینک" required>
        <Input id="giftLinkTitle" name="title" defaultValue={defaultTitle} required />
      </FormField>
      <FormField id="giftLinkMessage" label="پیام والد" hint="اختیاری؛ روی صفحه عمومی دیده می‌شود.">
        <Textarea id="giftLinkMessage" name="message" rows={3} />
      </FormField>
      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2Icon className="animate-spin" /> : null}
        ساخت لینک هدیه
      </Button>
    </form>
  );
}
