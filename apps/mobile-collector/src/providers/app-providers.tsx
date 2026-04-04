import { PropsWithChildren, useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "../lib/query-client";
import { useAuthStore } from "../store/auth.store";
import { colors } from "../constants/colors";
import { useSync } from "../hooks/useSync";

function SyncBootstrap() {
  const status = useAuthStore((state) => state.status);
  useSync();

  if (status !== "authenticated") {
    return null;
  }

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
    backgroundColor: colors.background
  }
});
