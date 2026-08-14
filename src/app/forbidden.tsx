import Link from "next/link";

import { Button } from "@/shared/ui/button";

export default function Forbidden() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">دسترسی ندارید</h1>
      <p className="text-muted-foreground">
        این بخش مخصوص کارکنان فروشگاه است. اگر فکر می‌کنید باید دسترسی داشته باشید، با مدیر هماهنگ
        کنید.
      </p>
      <Button asChild>
        <Link href="/">بازگشت به خانه</Link>
      </Button>
    </main>
  );
}
