"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LogOutIcon } from "lucide-react";

import { logout } from "@/modules/identity/actions/auth.actions";
import { Button } from "@/shared/ui/button";

export function LogoutButton({
  className,
  variant = "ghost",
}: {
  className?: string;
  variant?: "ghost" | "gold";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant={variant}
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
      <LogOutIcon />
      خروج
    </Button>
  );
}
