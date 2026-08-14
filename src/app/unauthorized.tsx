import Link from "next/link";

import { Button } from "@/shared/ui/button";

export default function Unauthorized() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">برای ادامه وارد شوید</h1>
      <p className="text-muted-foreground">
        نشست شما پایان یافته یا هنوز وارد نشده‌اید. با شماره موبایل دوباره وارد شوید.
      </p>
      <Button asChild>
        <Link href="/login?returnTo=/admin">ورود</Link>
      </Button>
    </main>
  );
}
