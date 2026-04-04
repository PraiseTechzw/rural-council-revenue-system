"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getDailyReport, getMonthlyReport, getRevenueBySource } from "@/api/reports.api";
import { listCollectors } from "@/api/collectors.api";
import { formatCurrency } from "@/lib/format";

export default function DashboardPage() {
  const dailyQuery = useQuery({
    queryKey: ["dashboard", "daily"],
    queryFn: () => getDailyReport({})
  });

  const monthlyQuery = useQuery({
    queryKey: ["dashboard", "monthly"],
    queryFn: () => getMonthlyReport({})
  });

  const bySourceQuery = useQuery({
    queryKey: ["dashboard", "source-summary"],
    queryFn: () => getRevenueBySource({})
  });

  const activeCollectorsQuery = useQuery({
    queryKey: ["dashboard", "active-collectors"],
    queryFn: () => listCollectors({ page: 1, limit: 1, status: "active" })
  });

  const totalRevenueToday = Number((dailyQuery.data as Record<string, unknown> | undefined)?.totalRevenue ?? 0);
  const paymentCountToday = Number((dailyQuery.data as Record<string, unknown> | undefined)?.paymentCount ?? 0);
  const totalRevenueMonth = Number((monthlyQuery.data as Record<string, unknown> | undefined)?.totalRevenue ?? 0);
  const activeCollectorsCount = Number(activeCollectorsQuery.data?.meta?.total ?? 0);
  const sourceSummary = (bySourceQuery.data ?? []) as Array<Record<string, unknown>>;

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Overview of council revenue performance and collection activity.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Revenue Today</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(totalRevenueToday)}</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Revenue This Month</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(totalRevenueMonth)}</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Payments Today</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{paymentCountToday}</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Active Collectors</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{activeCollectorsCount}</p>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Revenue by Source</h2>
            <Link href="/dashboard/reports" className="text-sm font-medium text-brand-700">
              Open reports
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-medium">Source</th>
                  <th className="px-3 py-2 font-medium">Payments</th>
                  <th className="px-3 py-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {sourceSummary.length === 0 ? (
                  <tr>
                    <td className="px-3 py-3 text-slate-500" colSpan={3}>
                      No source summary available.
                    </td>
                  </tr>
                ) : (
                  sourceSummary.slice(0, 6).map((row, index) => (
                    <tr key={`${String(row.sourceId ?? index)}`} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-800">{String(row.sourceName ?? "Unknown")}</td>
                      <td className="px-3 py-2 text-slate-700">{String(row.paymentCount ?? 0)}</td>
                      <td className="px-3 py-2 text-slate-700">{formatCurrency(Number(row.totalRevenue ?? 0))}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Quick Links</h2>
          <div className="mt-3 space-y-2">
            <Link href="/dashboard/payments" className="block rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
              View payments
            </Link>
            <Link href="/dashboard/receipts" className="block rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
              Lookup receipt
            </Link>
            <Link href="/dashboard/reports" className="block rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
              Open reports
            </Link>
            <Link href="/dashboard/collectors" className="block rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
              Manage collectors
            </Link>
          </div>
        </section>
      </div>
    </section>
  );
}
