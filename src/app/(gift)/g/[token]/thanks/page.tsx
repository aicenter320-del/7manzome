import type { Metadata } from "next";
import Link from "next/link";

import { site } from "@/shared/config/site";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";

export const metadata: Metadata = {
  title: "سپاس از هدیه شما",
  robots: { index: false, follow: false },
};

export default async function GiftThanksPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <main className="grid gap-6 text-center">
      <PageHeader
        title="هدیه‌تان ثبت شد"
        description="پس از تایید پرداخت، طلا با قیمت همان لحظه به گنجینه کودک اضافه می‌شود. اگر پیام یادگاری نوشته‌اید، در گنجینه می‌ماند."
      />
      <p className="text-muted-foreground">{site.slogan}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href={`/g/${token}`}>بازگشت به گنجینه</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">صفحه اصلی</Link>
        </Button>
      </div>
    </main>
  );
}
