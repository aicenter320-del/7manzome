"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { createTreasureAction } from "@/modules/treasury/actions/treasure.actions";
import { MG_PER_GRAM } from "@/shared/lib/gold";
import { toEnglishDigits } from "@/shared/lib/persian";
import { TREASURE_KINDS, type TreasureKind } from "@/shared/types/enums";
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

const KIND_LABELS: Record<TreasureKind, string> = {
  personal: "گنجینه دائمی",
  event: "گنجینه مناسبتی",
};

export function CreateTreasureForm({
  childrenList,
  defaultChildId,
}: {
  childrenList: Array<{ id: string; displayName: string }>;
  defaultChildId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [kind, setKind] = useState<TreasureKind>("personal");
  const [childId, setChildId] = useState(defaultChildId ?? childrenList[0]?.id ?? "");
  const [eventDateAt, setEventDateAt] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        setFormError(null);
        const form = new FormData(event.currentTarget);
        const title = String(form.get("title") ?? "").trim();
        const inviteMessage = String(form.get("inviteMessage") ?? "").trim();
        const targetGramsRaw = toEnglishDigits(String(form.get("targetGrams") ?? "").trim());
        const targetGrams = targetGramsRaw ? Number(targetGramsRaw) : NaN;
        const targetMg =
          Number.isInteger(targetGrams) && targetGrams > 0 ? targetGrams * MG_PER_GRAM : undefined;

        startTransition(async () => {
          const result = await createTreasureAction({
            childId,
            title,
            kind,
            visibility: "private",
            ...(inviteMessage ? { inviteMessage } : {}),
            ...(kind === "event" && eventDateAt ? { eventDateAt } : {}),
            ...(targetMg ? { targetMg } : {}),
          });

          if (!result.ok) {
            setFormError(result.error);
            return;
          }

          toast.success("گنجینه ساخته شد.");
          router.push(`/dashboard/treasures/${result.data.treasureId}`);
          router.refresh();
        });
      }}
    >
      {formError ? (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <FormField id="childId" label="کودک" required>
        <Select value={childId} onValueChange={setChildId}>
          <SelectTrigger id="childId">
            <SelectValue placeholder="کودک را انتخاب کنید" />
          </SelectTrigger>
          <SelectContent>
            {childrenList.map((child) => (
              <SelectItem key={child.id} value={child.id}>
                {child.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField id="title" label="عنوان گنجینه" required>
        <Input id="title" name="title" placeholder="گنجینه آراد" required />
      </FormField>

      <FormField id="kind" label="نوع">
        <Select value={kind} onValueChange={(value) => setKind(value as TreasureKind)}>
          <SelectTrigger id="kind">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TREASURE_KINDS.map((value) => (
              <SelectItem key={value} value={value}>
                {KIND_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      {kind === "event" ? (
        <FormField id="eventDateAt" label="تاریخ مناسبت" required>
          <JalaliDateInput id="eventDateAt" value={eventDateAt} onChange={setEventDateAt} />
        </FormField>
      ) : null}

      <FormField id="targetGrams" label="هدف (گرم)" hint="اختیاری؛ عدد صحیح به گرم.">
        <Input id="targetGrams" name="targetGrams" inputMode="numeric" className="ltr-nums" dir="ltr" />
      </FormField>

      <FormField id="inviteMessage" label="پیام دعوت" hint="اختیاری؛ روی صفحه هدیه دیده می‌شود.">
        <Textarea id="inviteMessage" name="inviteMessage" rows={3} />
      </FormField>

      <Button type="submit" disabled={isPending || !childId}>
        {isPending ? <Loader2Icon className="animate-spin" /> : null}
        ساخت گنجینه
      </Button>
    </form>
  );
}
