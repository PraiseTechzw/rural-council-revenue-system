"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getReceiptById } from "@/api/receipts.api";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";

export default function ReceiptDetailPage() {
  const params = useParams<{ id: string }>();
  const receiptId = params?.id;

  const receiptQuery = useQuery({
    queryKey: ["receipt", receiptId],
    queryFn: () => getReceiptById(receiptId),
    enabled: Boolean(receiptId)
  });

  if (receiptQuery.isLoading) {
    return <p className="text-sm text-slate-600">Loading receipt...</p>;
  }

  if (receiptQuery.isError || !receiptQuery.data) {
    return (
      <div className="space-y-4">
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">Unable to load receipt.</p>
        <Link href="/dashboard/receipts" className="text-sm font-medium text-brand-700">
          Back to receipts
        </Link>
      </div>
    );
  }

  const receipt = receiptQuery.data;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Receipt {receipt.receiptNumber}</h1>
        <Link href="/dashboard/receipts" className="text-sm font-medium text-brand-700">
          Back to receipts
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <dl className="grid gap-4 text-sm md:grid-cols-2">
          <div>
            <dt className="text-slate-500">Payer</dt>
            <dd className="font-medium text-slate-900">{receipt.payerName}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Collector</dt>
            <dd className="font-medium text-slate-900">{receipt.collectorName}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Revenue Source</dt>
            <dd className="font-medium text-slate-900">{receipt.revenueSourceName}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Ward</dt>
            <dd className="font-medium text-slate-900">{receipt.wardName ?? "N/A"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Amount</dt>
            <dd className="font-medium text-slate-900">{formatCurrency(receipt.amount, receipt.currency)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Payment Method</dt>
            <dd className="font-medium capitalize text-slate-900">{receipt.paymentMethod.replace("_", " ")}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Payment Date</dt>
            <dd className="font-medium text-slate-900">{formatDate(receipt.paymentDate)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Issued At</dt>
            <dd className="font-medium text-slate-900">{formatDateTime(receipt.issuedAt)}</dd>
          </div>
        </dl>

        {receipt.notes ? (
          <div className="mt-4 border-t border-slate-200 pt-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</h2>
            <p className="mt-1 text-sm text-slate-700">{receipt.notes}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
