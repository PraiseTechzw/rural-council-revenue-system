"use client";

import { type ReactNode, useEffect, useState } from "react";
import { apiBaseUrl, apiClient } from "@/api/client";

const RETRY_DELAY_MS = 2000;
const HEALTH_TIMEOUT_MS = 3000;

type ConnectionState = "checking" | "ready";

async function checkApiHealth(): Promise<void> {
  await apiClient.get("/health", {
    timeout: HEALTH_TIMEOUT_MS,
    headers: {
      "Cache-Control": "no-cache"
    }
  });
}

function ConnectionScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="mb-6 h-2 w-24 rounded-full bg-emerald-400" />
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-emerald-300">Connecting</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Waiting for the API server</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          The web admin is checking the backend before loading the dashboard.
        </p>
        <p className="mt-6 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-slate-300">
          Target: {apiBaseUrl}
        </p>
      </div>
    </div>
  );
}

export function ApiConnectionProvider({ children }: { children: ReactNode }) {
  const [connectionState, setConnectionState] = useState<ConnectionState>("checking");

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const waitForConnection = async () => {
      try {
        await checkApiHealth();

        if (!cancelled) {
          setConnectionState("ready");
        }
      } catch {
        if (!cancelled) {
          retryTimer = setTimeout(() => {
            void waitForConnection();
          }, RETRY_DELAY_MS);
        }
      }
    };

    void waitForConnection();

    return () => {
      cancelled = true;

      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, []);

  if (connectionState !== "ready") {
    return <ConnectionScreen />;
  }

  return <>{children}</>;
}
