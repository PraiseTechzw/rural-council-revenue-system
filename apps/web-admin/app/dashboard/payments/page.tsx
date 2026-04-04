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
    <section className="dashboard-page reveal">
      <header>
        <h1 className="dashboard-title">Payments Ledger</h1>
        <p className="dashboard-subtitle">Track transaction activity, validate references, and inspect individual payment records.</p>
      </header>

      <div className="premium-panel grid gap-3 p-4 md:grid-cols-4">
        <input
          className="premium-input"
          placeholder="Search receipt or payer"
          value={filters.search}
          onChange={(event) => {
            setPage(1);
            setFilters((prev) => ({ ...prev, search: event.target.value }));
          }}
        />
        <input
          type="date"
          className="premium-input"
          value={filters.startDate}
          onChange={(event) => {
            setPage(1);
            setFilters((prev) => ({ ...prev, startDate: event.target.value }));
          }}
        />
        <input
          type="date"
          className="premium-input"
          value={filters.endDate}
          onChange={(event) => {
            setPage(1);
            setFilters((prev) => ({ ...prev, endDate: event.target.value }));
          }}
        />
        <select
          className="premium-input"
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
        <div className="premium-panel p-4">
          <div className="premium-table-wrap">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Receipt</th>
                  <th>Payer</th>
                  <th>Collector</th>
                  <th>Source</th>
                  <th>Amount</th>
                  <th>Date</th>
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
                      className={`cursor-pointer border-t border-[#e9decb] ${selectedPaymentId === payment.id ? "bg-[#e7efe4]" : "hover:bg-[#f6f0e4]"}`}
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
                className="premium-button-outline"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((prev) => (prev < totalPages ? prev + 1 : prev))}
                disabled={page >= totalPages}
                className="premium-button-outline"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <aside className="premium-panel-strong p-4">
          <h2 className="text-base font-semibold text-slate-900">Payment Detail</h2>
          {!selectedPaymentId ? (
            <p className="mt-3 text-sm text-emerald-100/80">Select a payment row to view details.</p>
          ) : paymentDetailQuery.isLoading ? (
            <p className="mt-3 text-sm text-emerald-100/80">Loading details...</p>
          ) : paymentDetailQuery.isError || !paymentDetailQuery.data ? (
            <p className="mt-3 text-sm text-rose-200">Unable to load payment details.</p>
          ) : (
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-emerald-100/70">Receipt</dt>
                <dd className="font-medium text-white">{paymentDetailQuery.data.receipt.receiptNumber}</dd>
              </div>
              <div>
                <dt className="text-emerald-100/70">Amount</dt>
                <dd className="font-medium text-white">{formatCurrency(paymentDetailQuery.data.amount, paymentDetailQuery.data.currency)}</dd>
              </div>
              <div>
                <dt className="text-emerald-100/70">Method</dt>
                <dd className="font-medium capitalize text-white">{paymentDetailQuery.data.paymentMethod.replace("_", " ")}</dd>
              </div>
              <div>
                <dt className="text-emerald-100/70">Status</dt>
                <dd className="font-medium text-white">{paymentDetailQuery.data.status}</dd>
              </div>
              <div>
                <dt className="text-emerald-100/70">Sync Status</dt>
                <dd className="font-medium text-white">{paymentDetailQuery.data.syncStatus}</dd>
              </div>
              <div>
                <dt className="text-emerald-100/70">Notes</dt>
                <dd className="text-emerald-50">{paymentDetailQuery.data.notes ?? "-"}</dd>
              </div>
            </dl>
          )}
        </aside>
      </div>
    </section>
  );
}
