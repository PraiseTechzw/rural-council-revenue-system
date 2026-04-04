"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPaymentById, listPayments } from "@/api/payments.api";
import { formatCurrency, formatDateTime } from "@/lib/format";

type FiltersState = {
  startDate: string;
  endDate: string;
  collectorId: string;
  revenueSourceId: string;
  wardId: string;
  paymentMethod: string;
  status: string;
  search: string;
};

const initialFilters: FiltersState = {
  startDate: "",
  endDate: "",
  collectorId: "",
  revenueSourceId: "",
  wardId: "",
  paymentMethod: "",
  status: "",
  search: ""
};

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FiltersState>(initialFilters);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ""))
    }),
    [filters, page]
  );

  const paymentsQuery = useQuery({
    queryKey: ["payments", params],
    queryFn: () => listPayments(params)
  });

  const paymentDetailQuery = useQuery({
    queryKey: ["payment", selectedPaymentId],
    queryFn: () => getPaymentById(selectedPaymentId as string),
    enabled: Boolean(selectedPaymentId)
  });

  const totalPages = Number(paymentsQuery.data?.meta?.totalPages ?? 1);

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Payments</h1>
        <p className="mt-1 text-sm text-slate-600">Track payment activity, receipt references, and collector performance.</p>
      </header>

      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <input
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Search receipt or payer"
          value={filters.search}
          onChange={(event) => {
            setPage(1);
            setFilters((prev) => ({ ...prev, search: event.target.value }));
          }}
        />
        <input
          type="date"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={filters.startDate}
          onChange={(event) => {
            setPage(1);
            setFilters((prev) => ({ ...prev, startDate: event.target.value }));
          }}
        />
        <input
          type="date"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={filters.endDate}
          onChange={(event) => {
            setPage(1);
            setFilters((prev) => ({ ...prev, endDate: event.target.value }));
          }}
        />
        <select
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={filters.paymentMethod}
          onChange={(event) => {
            setPage(1);
            setFilters((prev) => ({ ...prev, paymentMethod: event.target.value }));
          }}
        >
          <option value="">All methods</option>
          <option value="cash">Cash</option>
          <option value="mobile_money">Mobile Money</option>
          <option value="bank">Bank</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-medium">Receipt</th>
                  <th className="px-3 py-2 font-medium">Payer</th>
                  <th className="px-3 py-2 font-medium">Collector</th>
                  <th className="px-3 py-2 font-medium">Source</th>
                  <th className="px-3 py-2 font-medium">Amount</th>
                  <th className="px-3 py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {paymentsQuery.isLoading ? (
                  <tr>
                    <td className="px-3 py-4 text-slate-500" colSpan={6}>
                      Loading payments...
                    </td>
                  </tr>
                ) : paymentsQuery.isError ? (
                  <tr>
                    <td className="px-3 py-4 text-rose-700" colSpan={6}>
                      Failed to load payments.
                    </td>
                  </tr>
                ) : paymentsQuery.data?.rows.length ? (
                  paymentsQuery.data.rows.map((payment) => (
                    <tr
                      key={payment.id}
                      className={`cursor-pointer border-t border-slate-100 ${selectedPaymentId === payment.id ? "bg-brand-50" : "hover:bg-slate-50"}`}
                      onClick={() => setSelectedPaymentId(payment.id)}
                    >
                      <td className="px-3 py-2 text-slate-800">{payment.receipt.receiptNumber}</td>
                      <td className="px-3 py-2 text-slate-700">{payment.payer.name}</td>
                      <td className="px-3 py-2 text-slate-700">
                        {payment.collector.firstName} {payment.collector.lastName}
                      </td>
                      <td className="px-3 py-2 text-slate-700">{payment.revenueSource.name}</td>
                      <td className="px-3 py-2 text-slate-700">{formatCurrency(payment.amount, payment.currency)}</td>
                      <td className="px-3 py-2 text-slate-700">{formatDateTime(payment.paymentDate)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-3 py-4 text-slate-500" colSpan={6}>
                      No payments found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <p className="text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
                className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((prev) => (prev < totalPages ? prev + 1 : prev))}
                disabled={page >= totalPages}
                className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Payment Detail</h2>
          {!selectedPaymentId ? (
            <p className="mt-3 text-sm text-slate-500">Select a payment row to view details.</p>
          ) : paymentDetailQuery.isLoading ? (
            <p className="mt-3 text-sm text-slate-500">Loading details...</p>
          ) : paymentDetailQuery.isError || !paymentDetailQuery.data ? (
            <p className="mt-3 text-sm text-rose-700">Unable to load payment details.</p>
          ) : (
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-slate-500">Receipt</dt>
                <dd className="font-medium text-slate-900">{paymentDetailQuery.data.receipt.receiptNumber}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Amount</dt>
                <dd className="font-medium text-slate-900">{formatCurrency(paymentDetailQuery.data.amount, paymentDetailQuery.data.currency)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Method</dt>
                <dd className="font-medium capitalize text-slate-900">{paymentDetailQuery.data.paymentMethod.replace("_", " ")}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="font-medium text-slate-900">{paymentDetailQuery.data.status}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Sync Status</dt>
                <dd className="font-medium text-slate-900">{paymentDetailQuery.data.syncStatus}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Notes</dt>
                <dd className="text-slate-800">{paymentDetailQuery.data.notes ?? "-"}</dd>
              </div>
            </dl>
          )}
        </aside>
      </div>
    </section>
  );
}
