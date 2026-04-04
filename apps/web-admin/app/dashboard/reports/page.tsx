"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDailyReport, getMonthlyReport, getRevenueByCollector, getRevenueBySource, getRevenueByWard } from "@/api/reports.api";
import { formatCurrency } from "@/lib/format";

export default function ReportsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const rangeParams = useMemo(
    () => ({
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {})
    }),
    [endDate, startDate]
  );

  const dailyQuery = useQuery({
    queryKey: ["reports", "daily", rangeParams],
    queryFn: () => getDailyReport({ ...(startDate ? { date: startDate } : {}) })
  });

  const monthlyQuery = useQuery({
    queryKey: ["reports", "monthly"],
    queryFn: () => getMonthlyReport({})
  });

  const sourceQuery = useQuery({
    queryKey: ["reports", "by-source", rangeParams],
    queryFn: () => getRevenueBySource(rangeParams)
  });

  const collectorQuery = useQuery({
    queryKey: ["reports", "by-collector", rangeParams],
    queryFn: () => getRevenueByCollector(rangeParams)
  });

  const wardQuery = useQuery({
    queryKey: ["reports", "by-ward", rangeParams],
    queryFn: () => getRevenueByWard(rangeParams)
  });

  const daily = (dailyQuery.data ?? {}) as Record<string, unknown>;
  const monthly = (monthlyQuery.data ?? {}) as Record<string, unknown>;

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Reports</h1>
        <p className="mt-1 text-sm text-slate-600">Revenue analysis by period, source, collector, and ward.</p>
      </header>

      <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <input type="date" className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        <input type="date" className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Daily Revenue</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(Number(daily.totalRevenue ?? 0))}</p>
          <p className="mt-1 text-sm text-slate-600">Payments: {String(daily.paymentCount ?? 0)}</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Monthly Revenue</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(Number(monthly.totalRevenue ?? 0))}</p>
          <p className="mt-1 text-sm text-slate-600">Payments: {String(monthly.paymentCount ?? 0)}</p>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ReportTable
          title="By Source"
          rows={(sourceQuery.data ?? []) as Array<Record<string, unknown>>}
          nameField="sourceName"
          idField="sourceId"
        />
        <ReportTable
          title="By Collector"
          rows={(collectorQuery.data ?? []) as Array<Record<string, unknown>>}
          nameField="collectorId"
          idField="collectorId"
        />
        <ReportTable
          title="By Ward"
          rows={(wardQuery.data ?? []) as Array<Record<string, unknown>>}
          nameField="wardName"
          idField="wardId"
        />
      </div>
    </section>
  );
}

function ReportTable({
  title,
  rows,
  nameField,
  idField
}: {
  title: string;
  rows: Array<Record<string, unknown>>;
  nameField: string;
  idField: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-base font-semibold text-slate-900">{title}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Payments</th>
              <th className="px-3 py-2 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={3}>
                  No data available.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={String(row[idField] ?? Math.random())} className="border-t border-slate-100">
                  <td className="px-3 py-2 text-slate-700">{String(row[nameField] ?? "N/A")}</td>
                  <td className="px-3 py-2 text-slate-700">{String(row.paymentCount ?? 0)}</td>
                  <td className="px-3 py-2 text-slate-700">{formatCurrency(Number(row.totalRevenue ?? 0))}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
