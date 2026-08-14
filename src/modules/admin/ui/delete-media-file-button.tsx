"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon, Trash2Icon } from "lucide-react";

import { Button } from "@/shared/ui/button";

import { softDeleteMediaFileAction } from "../actions/admin.actions";

export function DeleteMediaFileButton({ fileId }: { fileId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await softDeleteMediaFileAction({ fileId });
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("فایل از کتابخانه حذف شد.");
          router.refresh();
        });
      }}
    >
      {isPending ? <Loader2Icon className="animate-spin" /> : <Trash2Icon />}
      حذف
    </Button>
  );
}
