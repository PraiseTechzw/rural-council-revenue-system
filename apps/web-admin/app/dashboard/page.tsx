"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getDailyReport, getMonthlyReport, getRevenueBySource } from "@/api/reports.api";
import { listCollectors } from "@/api/collectors.api";
import { getDashboardRoleSummary, getNavigationItemsForRole } from "@/constants/navigation";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/components/providers/auth-provider";

export default function DashboardPage() {
  const { user } = useAuth();
  const roleSummary = getDashboardRoleSummary(user?.role);
  const roleNavigation = getNavigationItemsForRole(user?.role).filter((item) => item.href !== "/dashboard");

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
    <section className="dashboard-page reveal">
      <header className="premium-panel p-4">
        <p className="premium-kicker">{roleSummary.badge}</p>
        <h1 className="dashboard-title mt-2">{roleSummary.title}</h1>
        <p className="dashboard-subtitle">{roleSummary.subtitle}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {roleSummary.capabilities.map((capability) => (
            <span key={capability} className="rounded-full border border-[#d9cdb8] bg-[#fbf7ef] px-3 py-1 text-xs font-semibold text-slate-700">
              {capability}
            </span>
          ))}
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="premium-panel p-4">
          <p className="premium-kicker">Revenue Today</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(totalRevenueToday)}</p>
        </article>
        <article className="premium-panel p-4">
          <p className="premium-kicker">Revenue This Month</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(totalRevenueMonth)}</p>
        </article>
        <article className="premium-panel p-4">
          <p className="premium-kicker">Payments Today</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{paymentCountToday}</p>
        </article>
        <article className="premium-panel p-4">
          <p className="premium-kicker">Active Collectors</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{activeCollectorsCount}</p>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="premium-panel xl:col-span-2 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Revenue by Source</h2>
            <Link href="/dashboard/reports" className="text-sm font-semibold text-[#24442f] hover:text-[#183021]">
              Open reports
            </Link>
          </div>
          <div className="premium-table-wrap">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Payments</th>
                  <th>Total</th>
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
                    <tr key={`${String(row.sourceId ?? index)}`} className="border-t border-[#e9decb]">
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

        <section className="premium-panel-strong p-4">
          <h2 className="text-base font-semibold text-emerald-50">Quick Links</h2>
          <div className="mt-3 space-y-2">
            {roleNavigation.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-emerald-50 transition hover:bg-white/20">
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
