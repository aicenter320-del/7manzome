import { DataTable, TableCell, TableRow } from "@/modules/admin";
import { listFaqs, listPages } from "@/modules/content";
import { requirePermission } from "@/server/auth/guards";
import { PageHeader } from "@/shared/ui/page-header";

export default async function AdminContentPage() {
  await requirePermission("content:write");
  const [pages, faqs] = await Promise.all([listPages(), listFaqs()]);

  return (
    <div className="grid gap-10">
      <PageHeader title="محتوا" />

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">صفحات</h2>
        <DataTable
          columns={["عنوان", "نامک", "وضعیت"]}
          isEmpty={pages.length === 0}
          emptyTitle="صفحه‌ای نیست"
        >
          {pages.map((page) => (
            <TableRow key={page.id}>
              <TableCell>{page.title}</TableCell>
              <TableCell className="ltr-nums">{page.slug}</TableCell>
              <TableCell>{page.status === "published" ? "منتشرشده" : "پیش‌نویس"}</TableCell>
            </TableRow>
          ))}
        </DataTable>
      </section>

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">پرسش‌های متداول</h2>
        <DataTable
          columns={["پرسش", "دسته‌بندی"]}
          isEmpty={faqs.length === 0}
          emptyTitle="پرسشی نیست"
        >
          {faqs.map((faq) => (
            <TableRow key={faq.id}>
              <TableCell>{faq.question}</TableCell>
              <TableCell>{faq.category ?? "—"}</TableCell>
            </TableRow>
          ))}
        </DataTable>
      </section>
    </div>
  );
}
