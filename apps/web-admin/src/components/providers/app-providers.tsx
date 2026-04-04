"use client";

import { ReactNode } from "react";
import { ApiConnectionProvider } from "./api-connection-provider";
import { QueryProvider } from "./query-provider";
import { AuthProvider } from "./auth-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ApiConnectionProvider>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </ApiConnectionProvider>
  );
}