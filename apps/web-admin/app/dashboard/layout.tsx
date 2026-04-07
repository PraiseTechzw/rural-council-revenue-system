import type { ReactNode } from "react";
import { AppProviders } from "@/components/providers/app-providers";
import { DashboardAuthGate } from "@/components/layout/dashboard-auth-gate";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AppProviders>
      <DashboardAuthGate>{children}</DashboardAuthGate>
    </AppProviders>
  );
}
