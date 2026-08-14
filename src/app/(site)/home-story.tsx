import Link from "next/link";
import type { ReactNode } from "react";
import { BabyIcon, GiftIcon, Link2Icon, PenLineIcon, ScaleIcon, SparklesIcon } from "lucide-react";

import { site } from "@/shared/config/site";
import { Button } from "@/shared/ui/button";

function Step({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="grid gap-3 rounded-3xl bg-card/70 p-5">
      <span className="flex size-12 items-center justify-center rounded-full bg-gold-soft text-gold-deep">
        {icon}
      </span>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
    </li>
  );
}

function TrustCard({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <article className="grid gap-3 rounded-3xl bg-card p-6">
      <span className="flex size-12 items-center justify-center rounded-full bg-treasure-soft text-treasure">
        {icon}
      </span>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
    </article>
  );
}

/** مسیر ساخت گنجینه؛ همان کارهایی که در پنل والد انجام می‌شود. */
export function HomeHowItWorks() {
  return (
    <section className="bg-secondary px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto grid w-full max-w-6xl gap-10">
        <div className="max-w-2xl grid gap-3">
          <h2 className="text-xl font-semibold sm:text-2xl">از پروفایل کودک تا گنجینه</h2>
          <p className="text-muted-foreground">
            در حساب کاربری، کودک را ثبت می‌کنید، گنجینه می‌سازید و لینک هدیه را با خانواده
            به اشتراک می‌گذارید.
          </p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-3">
          <Step
            icon={<BabyIcon className="size-5" aria-hidden />}
            title="کودک را بشناسید"
            body="نام و تاریخ تولد را وارد کنید تا مناسبت‌ها و پیشنهاد هدیه با سن او هماهنگ باشد."
          />
          <Step
            icon={<SparklesIcon className="size-5" aria-hidden />}
            title="گنجینه باز کنید"
            body="برای او یک گنجینه بسازید، هدف تعیین کنید و پیشرفت وزن طلا را ببینید."
          />
          <Step
            icon={<GiftIcon className="size-5" aria-hidden />}
            title="خانواده را دعوت کنید"
            body="لینک هدیه را بفرستید. فامیل بدون ساخت حساب مشارکت می‌کند و پیام یادگاری می‌گذارد."
          />
        </ol>
        <div>
          <Button asChild variant="gold" size="lg">
            <Link href="/login?returnTo=/dashboard/treasures/new">شروع گنجینه</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/** دعوت به هدیه مهمان؛ مسیر واقعی /gift و لینک گنجینه. */
export function HomeGiftBand() {
  return (
    <section className="bg-treasure px-4 py-16 text-primary-foreground sm:px-6 sm:py-20">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="grid gap-4">
          <h2 className="text-2xl font-semibold text-balance sm:text-3xl">
            فامیل بدون ورود، طلا هدیه می‌دهد
          </h2>
          <p className="max-w-xl text-primary-foreground/80 leading-relaxed">
            لینک گنجینه را بفرستید. مهمان مبلغ را انتخاب می‌کند، یادگاری می‌نویسد و پس از تایید
            پرداخت، طلا با قیمت همان لحظه به گنجینه کودک اضافه می‌شود. کارت هدیه فیزیکی با کد
            هم قابل استفاده است.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="gold" size="lg">
              <Link href="/gift">هدیه بده</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="text-primary-foreground hover:bg-gold-soft/20 hover:text-primary-foreground"
            >
              <Link href="/treasures">گنجینه‌های در حال ساخت</Link>
            </Button>
          </div>
        </div>
        <ul className="grid gap-3 text-sm">
          <li className="rounded-2xl bg-primary-foreground/10 px-5 py-4">بدون ساخت حساب برای مهمان</li>
          <li className="rounded-2xl bg-primary-foreground/10 px-5 py-4">پیام یادگاری کنار هر هدیه</li>
          <li className="rounded-2xl bg-primary-foreground/10 px-5 py-4">طلا فقط پس از تایید پرداخت</li>
        </ul>
      </div>
    </section>
  );
}

/** اعتماد: شفافیت قیمت و شخصی‌سازی واقعی صفحه محصول. */
export function HomeTrustBand() {
  return (
    <section className="bg-background px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto grid w-full max-w-6xl gap-10">
        <div className="max-w-2xl grid gap-3">
          <h2 className="text-xl font-semibold sm:text-2xl">شفاف، ماندگار، به نام او</h2>
          <p className="text-muted-foreground">
            همان چیزهایی که در فروشگاه و پنل می‌بینید: ریزقیمت، حکاکی، و لینک دعوت خانواده.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <TrustCard
            icon={<ScaleIcon className="size-5" aria-hidden />}
            title="قیمت کاملاً باز"
            body="وزن، عیار، ارزش طلای خام، اجرت، سود و مالیات روی هر محصول دیده می‌شود. سفارش با همان اعداد قفل می‌شود."
          />
          <TrustCard
            icon={<PenLineIcon className="size-5" aria-hidden />}
            title="به نام کودک"
            body="روی قطعه‌های قابل شخصی‌سازی می‌توانید نام یا یادگاری حک کنید؛ هدیه‌ای که مال اوست."
          />
          <TrustCard
            icon={<Link2Icon className="size-5" aria-hidden />}
            title="یک لینک برای همه"
            body="به‌جای بیست هدیه پراکنده، سهم خانواده در یک گنجینه جمع می‌شود و پیشرفت وزن طلا را می‌بینید."
          />
        </div>
      </div>
    </section>
  );
}

/** شعار برند؛ سکشن پایانی هم‌وزن بقیه نوارها. */
export function HomeSloganBand() {
  return (
    <section className="bg-gold-soft px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto grid w-full max-w-3xl justify-items-center gap-6 text-center">
        <p className="text-2xl font-semibold text-treasure text-balance sm:text-4xl">
          {site.slogan}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="gold" size="lg">
            <Link href="/products">مشاهده محصولات</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login?returnTo=/dashboard">ورود به حساب</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
