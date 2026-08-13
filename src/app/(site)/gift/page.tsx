import Link from "next/link";

import { site } from "@/shared/config/site";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { PageHeader } from "@/shared/ui/page-header";

import { RedeemGiftCardForm } from "./redeem-form";

export default function GiftPage() {
  return (
    <main className="mx-auto grid w-full max-w-3xl gap-8 px-4 py-10 sm:px-6">
      <PageHeader
        title="هدیه بده؛ گنجینه بساز"
        description="با یک لینک، بدون ساخت حساب، می‌توانید به گنجینه طلای یک کودک اضافه کنید."
      />

      <p className="leading-relaxed text-muted-foreground">
        به‌جای هدیه‌ای که فراموش می‌شود، طلایی بدهید که می‌ماند. والد لینک گنجینه را برای شما
        می‌فرستد؛ شما مبلغ را انتخاب می‌کنید و یک پیام یادگاری می‌گذارید. طلا پس از تایید پرداخت
        با قیمت همان لحظه به گنجینه کودک اضافه می‌شود.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>کارت هدیه فیزیکی دارید؟</CardTitle>
        </CardHeader>
        <CardContent>
          <RedeemGiftCardForm />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="gold">
          <Link href="/login?returnTo=/dashboard/treasures/new">ورود و ساخت گنجینه</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">خرید طلا برای کودک</Link>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">{site.slogan}</p>
    </main>
  );
}
