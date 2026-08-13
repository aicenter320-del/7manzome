import { notFound } from "next/navigation";

import { canReview, getPaymentById, PaymentStatusCard } from "@/modules/payments";
import { requirePermission } from "@/server/auth/guards";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";

import { PaymentReviewForm } from "./review-form";

export default async function AdminPaymentDetailPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  await requirePermission("payment:read");
  const { paymentId } = await params;
  const payment = await getPaymentById(paymentId);
  if (!payment) notFound();

  return (
    <div className="grid gap-8">
      <PageHeader title={payment.paymentNumber} />
      <PaymentStatusCard payment={payment} bankAccount={payment.bankAccount} />

      {payment.receipts.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="text-lg font-semibold">رسیدها</h2>
          <ul className="grid gap-3">
            {payment.receipts.map((receipt) => (
              <li key={receipt.id} className="rounded-xl border border-border bg-card p-4 text-sm">
                <p>پیگیری: <span className="ltr-nums">{receipt.referenceNumber}</span></p>
                <p>
                  مبلغ اعلامی: <Money rial={receipt.paidAmountRial} />
                </p>
                <p>واریزکننده: {receipt.payerName}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {canReview(payment.status) ? <PaymentReviewForm paymentId={payment.id} /> : null}
    </div>
  );
}
