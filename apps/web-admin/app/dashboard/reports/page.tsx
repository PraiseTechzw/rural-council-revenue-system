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
    <section className="dashboard-page reveal">
      <header>
        <h1 className="dashboard-title">Revenue Reports</h1>
        <p className="dashboard-subtitle">Multi-angle analysis by time period, source, collector, and ward.</p>
      </header>

      <div className="premium-panel flex flex-col gap-2 p-4 sm:flex-row">
        <input type="date" className="premium-input" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        <input type="date" className="premium-input" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="premium-panel p-4">
          <p className="premium-kicker">Daily Revenue</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(Number(daily.totalRevenue ?? 0))}</p>
          <p className="mt-1 text-sm text-slate-600">Payments: {String(daily.paymentCount ?? 0)}</p>
        </article>
        <article className="premium-panel p-4">
          <p className="premium-kicker">Monthly Revenue</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(Number(monthly.totalRevenue ?? 0))}</p>
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
    <section className="premium-panel p-4">
      <h2 className="mb-2 text-base font-semibold text-slate-900">{title}</h2>
      <div className="premium-table-wrap">
        <table className="premium-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Payments</th>
              <th>Total</th>
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
                <tr key={String(row[idField] ?? Math.random())} className="border-t border-[#e9decb]">
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
