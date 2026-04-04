"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/providers/auth-provider";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isLoadingAuth, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!isLoadingAuth && user && !(user.role === "admin" || user.role === "finance_officer")) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoadingAuth, router, user]);

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="premium-panel px-8 py-6 text-center">
          <p className="premium-kicker">Initializing</p>
          <p className="mt-2 text-sm font-medium text-slate-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
