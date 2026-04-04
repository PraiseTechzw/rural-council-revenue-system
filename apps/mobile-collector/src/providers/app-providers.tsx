import { PropsWithChildren, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";

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

  useEffect(() => {
    hydrate();
  }, [hydrate]);

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
  }
});
