import { BankAccountCard, listAllBankAccounts } from "@/modules/payments";
import { requirePermission } from "@/server/auth/guards";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";

import { CreateBankAccountForm, ToggleBankAccountButton } from "./bank-account-forms";

export default async function AdminBankAccountsPage() {
  await requirePermission("payment:review");
  const accounts = await listAllBankAccounts();

  return (
    <div className="grid gap-8">
      <PageHeader title="حساب‌های بانکی" description="مقصد کارت‌به‌کارت مشتریان." />

      {accounts.length === 0 ? (
        <EmptyState title="حسابی ثبت نشده" description="یک حساب فعال برای دریافت واریز اضافه کنید." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {accounts.map((account) => (
            <div key={account.id} className="grid gap-2">
              <BankAccountCard account={account} />
              <ToggleBankAccountButton bankAccountId={account.id} isActive={account.isActive} />
            </div>
          ))}
        </div>
      )}

      <CreateBankAccountForm />
    </div>
  );
}
