import Link from "next/link";

import { Button } from "@/shared/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">این صفحه پیدا نشد</h1>
      <p className="text-muted-foreground">
        نشانی را بررسی کنید یا به صفحه اصلی برگردید. اگر از لینک هدیه آمده‌اید، از فرستنده لینک درست
        را بخواهید.
      </p>
      <Button asChild>
        <Link href="/">بازگشت به خانه</Link>
      </Button>
    </main>
  );
}
