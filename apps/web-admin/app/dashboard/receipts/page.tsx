"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getReceiptByNumber } from "@/api/receipts.api";
import { listPayments } from "@/api/payments.api";
import { formatCurrency, formatDate } from "@/lib/format";

export default function ReceiptsPage() {
  const [lookupInput, setLookupInput] = useState("");
  const [lookupNumber, setLookupNumber] = useState<string | null>(null);

  const lookupQuery = useQuery({
    queryKey: ["receipt-lookup", lookupNumber],
    queryFn: () => getReceiptByNumber(lookupNumber as string),
    enabled: Boolean(lookupNumber)
  });

  const recentPaymentsQuery = useQuery({
    queryKey: ["receipts", "recent"],
    queryFn: () => listPayments({ page: 1, limit: 20 })
  });

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Receipts</h1>
        <p className="mt-1 text-sm text-slate-600">Search by receipt number or open recent receipts.</p>
      </header>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            const value = lookupInput.trim();
            setLookupNumber(value.length > 0 ? value : null);
          }}
        >
          <input
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Enter receipt number"
            value={lookupInput}
            onChange={(event) => setLookupInput(event.target.value)}
          />
          <button className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800" type="submit">
            Lookup
          </button>
        </form>

        {lookupNumber ? (
          <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
            {lookupQuery.isLoading ? <p className="text-sm text-slate-600">Searching receipt...</p> : null}
            {lookupQuery.isError ? <p className="text-sm text-rose-700">Receipt was not found.</p> : null}
            {lookupQuery.data ? (
              <div className="space-y-1 text-sm text-slate-800">
                <p>
                  <span className="font-medium">Receipt:</span> {lookupQuery.data.receiptNumber}
                </p>
                <p>
                  <span className="font-medium">Payer:</span> {lookupQuery.data.payerName}
                </p>
                <p>
                  <span className="font-medium">Amount:</span> {formatCurrency(lookupQuery.data.amount, lookupQuery.data.currency)}
                </p>
                <Link href={`/dashboard/receipts/${lookupQuery.data.id}`} className="inline-block pt-1 text-sm font-medium text-brand-700">
                  Open detail
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Recent Receipts</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2 font-medium">Receipt</th>
                <th className="px-3 py-2 font-medium">Payer</th>
                <th className="px-3 py-2 font-medium">Collector</th>
                <th className="px-3 py-2 font-medium">Amount</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentPaymentsQuery.isLoading ? (
                <tr>
                  <td className="px-3 py-4 text-slate-500" colSpan={6}>
                    Loading recent receipts...
                  </td>
                </tr>
              ) : recentPaymentsQuery.data?.rows.length ? (
                recentPaymentsQuery.data.rows
                  .filter((payment) => Boolean(payment.receipt.id))
                  .map((payment) => (
                    <tr key={payment.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-800">{payment.receipt.receiptNumber}</td>
                      <td className="px-3 py-2 text-slate-700">{payment.payer.name}</td>
                      <td className="px-3 py-2 text-slate-700">
                        {payment.collector.firstName} {payment.collector.lastName}
                      </td>
                      <td className="px-3 py-2 text-slate-700">{formatCurrency(payment.amount, payment.currency)}</td>
                      <td className="px-3 py-2 text-slate-700">{formatDate(payment.paymentDate)}</td>
                      <td className="px-3 py-2 text-slate-700">
                        <Link href={`/dashboard/receipts/${payment.receipt.id}`} className="font-medium text-brand-700">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td className="px-3 py-4 text-slate-500" colSpan={6}>
                    No receipts available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
