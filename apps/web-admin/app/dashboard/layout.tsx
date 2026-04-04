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
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-600">Loading dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
