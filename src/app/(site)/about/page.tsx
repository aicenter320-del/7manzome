import { getPageBySlug, listFaqs } from "@/modules/content";
import { site } from "@/shared/config/site";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { PageHeader } from "@/shared/ui/page-header";

const FALLBACK_STORY = `${site.name} طلافروشی آنلاین تخصصی کودکان است. زیر این پوسته، یک گنجینه طلا برای هر کودک ساخته می‌شود: والدین و اطرافیان به‌جای هدایای مصرفی، طلا می‌خرند و به‌مرور یک دارایی واقعی می‌سازند.

هدیه‌دهندگان با یک لینک و بدون ساخت حساب مشارکت می‌کنند. طلا فقط پس از تایید قطعی پرداخت وارد دفتر کل می‌شود و قیمت هنگام ثبت سفارش قفل می‌گردد.

${site.slogan}`;

export default async function AboutPage() {
  const [page, faqs] = await Promise.all([getPageBySlug("about"), listFaqs()]);
  const body =
    page?.status === "published" && page.bodyMarkdown.trim()
      ? page.bodyMarkdown
      : FALLBACK_STORY;

  return (
    <main className="mx-auto grid w-full max-w-3xl gap-10 px-4 py-10 sm:px-6">
      <PageHeader title={page?.title ?? "درباره هفت منظومه"} description={site.description} />

      <article className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{body}</article>

      {faqs.length > 0 ? (
        <section className="grid gap-4">
          <h2 className="text-lg font-semibold">پرسش‌های متداول</h2>
          <Accordion type="single" collapsible className="glass rounded-3xl px-4">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ) : null}
    </main>
  );
}
