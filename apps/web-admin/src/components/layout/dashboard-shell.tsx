"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { navigationItems } from "@/constants/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { hasRole } from "@/lib/guards";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const visibleNavigation = navigationItems.filter((item) => hasRole(user?.role, item.roles));

  return (
    <div className="min-h-screen text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1640px] gap-3 px-3 py-3 lg:gap-5 lg:px-5 lg:py-5">
        <aside className="hidden w-72 premium-panel-strong p-5 lg:block">
          <div className="mb-8 border-b border-white/15 pb-5">
            <p className="premium-kicker text-emerald-100/70">Rural Council</p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-white">Revenue Command</h1>
            <p className="mt-1 text-sm text-emerald-100/80">Administrative dashboard</p>
          </div>

          <nav className="space-y-1.5">
            {visibleNavigation.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-[#f0e8da] text-emerald-950 shadow-[0_8px_18px_rgba(0,0,0,0.2)]"
                      : "text-emerald-100/90 hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col gap-3 lg:gap-5">
          <header className="premium-panel sticky top-3 z-10 px-4 py-3 lg:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="premium-kicker">Signed In As</p>
                <p className="text-sm font-semibold text-slate-900">
                  {user ? `${user.firstName} ${user.lastName}` : "Unknown user"}
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  router.replace("/login");
                }}
                className="premium-button-outline"
              >
                Logout
              </button>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {visibleNavigation.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "border-[#274535] bg-[#274535] text-[#f4f1e9]"
                        : "border-[#d9cdb8] bg-[#faf4e8] text-slate-700 hover:bg-[#f2e8d6]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </header>

          <main className="flex-1 pb-6 lg:pb-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
