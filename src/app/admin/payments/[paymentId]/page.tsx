import { notFound } from "next/navigation";

import {
  canReview,
  getPaymentById,
  PaymentStatusCard,
  ReceiptFilePreview,
} from "@/modules/payments";
import { requirePermission } from "@/server/auth/guards";
import { toPersianDigits } from "@/shared/lib/persian";
import { JalaliDate } from "@/shared/ui/jalali-date";
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
              <li key={receipt.id} className="glass rounded-3xl p-4 text-sm">
                <p>
                  پیگیری: <span className="ltr-nums">{receipt.referenceNumber}</span>
                </p>
                <p>
                  مبلغ اعلامی: <Money rial={receipt.paidAmountRial} />
                </p>
                <p>واریزکننده: {receipt.payerName}</p>
                {receipt.payerCardLast4 ? (
                  <p>
                    چهار رقم آخر کارت:{" "}
                    <span className="ltr-nums">{toPersianDigits(receipt.payerCardLast4)}</span>
                  </p>
                ) : null}
                {receipt.bankName ? <p>بانک: {receipt.bankName}</p> : null}
                <p>
                  زمان واریز: <JalaliDate at={receipt.paidAt} variant="datetime" />
                </p>
                {receipt.note ? <p>توضیح: {receipt.note}</p> : null}
                <ReceiptFilePreview fileId={receipt.receiptFileId} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {canReview(payment.status) ? <PaymentReviewForm paymentId={payment.id} /> : null}
    </div>
  );
}
