"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { logout } from "@/modules/identity/actions/auth.actions";
import { Button } from "@/shared/ui/button";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={className}
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await logout({});
          router.push("/");
          router.refresh();
        });
      }}
    >
      خروج
    </Button>
  );
}
