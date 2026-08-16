import { getPageBySlug, listFaqs } from "@/modules/content";
import { copy } from "@/shared/config/copy";
import { site } from "@/shared/config/site";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { PageHeader } from "@/shared/ui/page-header";

const FALLBACK_STORY = copy.about.fallbackStory;

export default async function AboutPage() {
  const [page, faqs] = await Promise.all([getPageBySlug("about"), listFaqs()]);
  const body =
    page?.status === "published" && page.bodyMarkdown.trim()
      ? page.bodyMarkdown
      : FALLBACK_STORY;

  return (
    <main className="grid gap-10 px-4 py-6">
      <PageHeader title={page?.title ?? copy.about.fallbackTitle} description={site.description} />

      <article className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{body}</article>

      {faqs.length > 0 ? (
        <section className="grid gap-4">
          <h2 className="text-lg font-semibold">{copy.about.faqsHeading}</h2>
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
