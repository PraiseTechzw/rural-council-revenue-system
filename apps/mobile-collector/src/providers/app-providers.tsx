import { PropsWithChildren, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";

import { checkBackendHealth } from "../api/health.api";
import { queryClient } from "../lib/query-client";
import { useAuthStore } from "../store/auth.store";
import { colors } from "../constants/colors";
import { useSync } from "../hooks/useSync";

function SyncBootstrap() {
  const status = useAuthStore((state) => state.status);
  useSync({ enabled: status === "authenticated" });

  return null;
}

function AuthHydrationGate({ children }: PropsWithChildren) {
  const status = useAuthStore((state) => state.status);
  const hydrate = useAuthStore((state) => state.hydrate);
  const [backendState, setBackendState] = useState<"checking" | "ready" | "failed">("checking");
  const [backendError, setBackendError] = useState<string | null>(null);

  const validateBackendAndHydrate = async () => {
    setBackendState("checking");
    setBackendError(null);

    try {
      await checkBackendHealth();
      setBackendState("ready");
      await hydrate();
    } catch (error) {
      setBackendState("failed");
      setBackendError(error instanceof Error ? error.message : "Could not connect to backend API.");
    }
  };

  useEffect(() => {
    void validateBackendAndHydrate();
  }, []);

  if (backendState === "checking") {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderTitle}>Connecting to backend</Text>
        <Text style={styles.loaderText}>Please wait while the app connects to the API server.</Text>
      </View>
    );
  }

  if (backendState === "failed") {
    return (
      <View style={styles.loaderWrap}>
        <Text style={styles.loaderTitle}>Backend Connection Failed</Text>
        <Text style={styles.loaderText}>{backendError || "Cannot reach API server."}</Text>
        <Text style={styles.loaderText}>Ensure API server is running and reachable from your device.</Text>
        <Pressable style={styles.retryButton} onPress={() => void validateBackendAndHydrate()}>
          <Text style={styles.retryText}>Retry Connection</Text>
        </Pressable>
      </View>
    );
  }

  if (status === "idle" || status === "hydrating") {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderTitle}>Checking your session</Text>
        <Text style={styles.loaderText}>Please wait while the app verifies your account.</Text>
      </View>
    );
  }

  return children;
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthHydrationGate>
        <SyncBootstrap />
        {children}
      </AuthHydrationGate>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    gap: 8
  },
  loaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 8
  },
  loaderText: {
    color: colors.textSecondary,
    textAlign: "center"
  },
  retryButton: {
    marginTop: 6,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  retryText: {
    color: "#fff",
    fontWeight: "700"
  }
});
