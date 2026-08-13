"use client";

import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";

/** نوار اشتراک‌گذاری لینک هدیه برای دارنده حساب. */
export function GiftShareBar({ url }: { url: string }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("پیوند کپی شد.");
    } catch {
      toast.error("کپی پیوند ممکن نشد. آن را دستی کپی کنید.");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="ltr-nums min-w-0 flex-1 truncate rounded-lg bg-muted px-3 py-2 text-sm text-start">
        {url}
      </code>
      <Button type="button" variant="outline" onClick={() => void handleCopy()}>
        <CopyIcon />
        کپی پیوند
      </Button>
    </div>
  );
}
