import { notFound } from "next/navigation";

import {
  canSubmitReceipt,
  getPaymentById,
  PaymentStatusCard,
  ReceiptForm,
} from "@/modules/payments";
import { PageHeader } from "@/shared/ui/page-header";

export default async function PayPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  const payment = await getPaymentById(paymentId);

  if (!payment) notFound();

  return (
    <main className="grid gap-8 px-4 py-6">
      <PageHeader
        title="پرداخت کارت‌به‌کارت"
        description="مبلغ را به کارت مقصد واریز کنید و رسید را ثبت کنید تا بررسی شود."
      />

      <PaymentStatusCard payment={payment} bankAccount={payment.bankAccount} />

      {canSubmitReceipt(payment.status) ? (
        <ReceiptForm paymentId={payment.id} expectedAmountRial={payment.amountRial} />
      ) : (
        <p className="text-sm text-muted-foreground">
          در این وضعیت نیازی به ارسال رسید جدید نیست. اگر پرداخت تایید شود، نتیجه از همین صفحه
          مشخص می‌شود.
        </p>
      )}
    </main>
  );
}
