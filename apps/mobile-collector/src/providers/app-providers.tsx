import { Component, PropsWithChildren } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";

import { checkBackendHealth } from "../api/health.api";
import { queryClient } from "../lib/query-client";
import { useAuthStore } from "../store/auth.store";
import { colors } from "../constants/colors";

type AuthBootstrapGateState = {
  backendState: "checking" | "ready" | "failed";
  backendError: string | null;
  authState: "idle" | "hydrating" | "ready";
};

class AuthBootstrapGate extends Component<PropsWithChildren, AuthBootstrapGateState> {
  state: AuthBootstrapGateState = {
    backendState: "checking",
    backendError: null,
    authState: "idle"
  };

  private isMountedFlag = false;

  async componentDidMount() {
    this.isMountedFlag = true;
    await this.validateBackendAndHydrate();
  }

  componentWillUnmount() {
    this.isMountedFlag = false;
  }

  private setSafeState(nextState: Partial<AuthBootstrapGateState>) {
    if (this.isMountedFlag) {
      this.setState(nextState as Pick<AuthBootstrapGateState, keyof AuthBootstrapGateState>);
    }
  }

  private async validateBackendAndHydrate() {
    this.setSafeState({ backendState: "checking", backendError: null, authState: "idle" });

    try {
      await checkBackendHealth();
      this.setSafeState({ backendState: "ready", authState: "hydrating" });

      await useAuthStore.getState().hydrate();

      this.setSafeState({ authState: "ready" });
    } catch (error) {
      this.setSafeState({
        backendState: "failed",
        backendError: error instanceof Error ? error.message : "Could not connect to backend API.",
        authState: "idle"
      });
    }
  }

  render() {
    const { backendError, backendState, authState } = this.state;

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
          <Pressable style={styles.retryButton} onPress={() => void this.validateBackendAndHydrate()}>
            <Text style={styles.retryText}>Retry Connection</Text>
          </Pressable>
        </View>
      );
    }

    if (authState === "hydrating" || authState === "idle") {
      return (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderTitle}>Checking your session</Text>
          <Text style={styles.loaderText}>Please wait while the app verifies your account.</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrapGate>{children}</AuthBootstrapGate>
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
