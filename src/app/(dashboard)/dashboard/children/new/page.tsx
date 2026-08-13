import { ChildForm } from "@/modules/children";
import { requireUser } from "@/server/auth/guards";
import { PageHeader } from "@/shared/ui/page-header";

export default async function NewChildPage() {
  await requireUser("/dashboard/children/new");

  return (
    <div className="grid gap-6">
      <PageHeader
        title="پروفایل کودک جدید"
        description="تاریخ تولد برای پیشنهاد مناسبت و هدیه ضروری است."
      />
      <ChildForm />
    </div>
  );
}
