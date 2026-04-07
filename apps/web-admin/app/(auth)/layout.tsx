import type { ReactNode } from "react";
import { AppProviders } from "@/components/providers/app-providers";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <AppProviders>{children}</AppProviders>
      </div>
    </div>
  );
}
