import { getUserById, KycForm, ProfileForm } from "@/modules/identity";
import { requireUser } from "@/server/auth/guards";
import { notFound } from "next/navigation";
import { PageHeader } from "@/shared/ui/page-header";

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ kyc?: string | string[] }>;
}) {
  const user = await requireUser("/dashboard/profile");
  const profile = await getUserById(user.id);
  if (!profile) notFound();

  const params = await searchParams;
  const kycRequired = firstParam(params.kyc) === "required";

  return (
    <div className="grid gap-10">
      <PageHeader
        title="پروفایل"
        description={
          kycRequired
            ? "برای این عملیات، احراز هویت کامل لازم است."
            : "ورود با موبایل کافی است؛ احراز هویت کامل فقط برای برخی عملیات مالی لازم است."
        }
      />

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">اطلاعات حساب</h2>
        <ProfileForm user={profile} />
      </section>

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">احراز هویت کامل</h2>
        <KycForm
          status={profile.kycStatus}
          defaults={{ firstName: profile.firstName, lastName: profile.lastName }}
        />
      </section>
    </div>
  );
}
