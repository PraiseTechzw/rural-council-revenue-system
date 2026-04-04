import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";

import { AppScreen } from "../../src/components/app-screen";
import { FormInput } from "../../src/components/form-input";
import { PrimaryButton } from "../../src/components/primary-button";
import { colors } from "../../src/constants/colors";
import { appConfig } from "../../src/constants/config";
import { collectorLoginSchema, type CollectorLoginInput } from "../../src/features/auth";
import { useAuth } from "../../src/hooks/useAuth";
import { useNetworkStatus } from "../../src/hooks/useNetworkStatus";
import { getErrorMessage } from "../../src/utils/error";

export default function LoginScreen() {
  const { login, setError, errorMessage } = useAuth();
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState } = useForm<CollectorLoginInput>({
    resolver: zodResolver(collectorLoginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await login(values);
      router.replace("/(tabs)/dashboard");
    } catch (error) {
      setError(getErrorMessage(error, "Login failed."));
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <AppScreen>
      <View style={styles.heroCard}>
        <Image source={require("../../assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>Field Collector App</Text>
        </View>
        <Text style={styles.title}>Collector Sign In</Text>
        <Text style={styles.subtitle}>Rural District Council Revenue Collection</Text>
        <View style={styles.connectionRow}>
          <View style={[styles.connectionDot, { backgroundColor: isConnected && isInternetReachable ? colors.success : colors.warning }]} />
          <Text style={[styles.connection, { color: isConnected && isInternetReachable ? colors.success : colors.warning }]}> 
            {isConnected && isInternetReachable ? "Connected to server" : "Offline mode: login requires internet"}
          </Text>
        </View>
        <Text style={styles.endpoint}>API: {appConfig.apiBaseUrl}</Text>
      </View>

      <View style={styles.formCard}>
      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange } }) => (
          <FormInput
            label="Email"
            placeholder="collector@example.com"
            value={value}
            onChangeText={onChange}
            keyboardType="email-address"
            error={formState.errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange } }) => (
          <FormInput
            label="Password"
            placeholder="Enter your password"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            error={formState.errors.password?.message}
          />
        )}
      />

      {errorMessage ? <Text style={styles.errorBanner}>{errorMessage}</Text> : null}

      <PrimaryButton label="Sign In" onPress={onSubmit} loading={isSubmitting} />

      <Link href="/(auth)/forgot-password" style={styles.forgotLink}>
        Forgot password?
      </Link>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 20,
    gap: 6,
    shadowColor: colors.primary,
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 14,
    backgroundColor: "#fff",
    padding: 4,
    marginBottom: 4
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999
  },
  heroBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase"
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff"
  },
  subtitle: {
    color: "#D9FFF6"
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 14,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2
  },
  connectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  connectionDot: {
    width: 10,
    height: 10,
    borderRadius: 999
  },
  connection: {
    fontWeight: "700"
  },
  endpoint: {
    color: "#E9FDF9",
    fontSize: 12
  },
  errorBanner: {
    backgroundColor: "#FEE2E2",
    color: colors.danger,
    borderRadius: 10,
    padding: 12,
    fontWeight: "600"
  },
  forgotLink: {
    color: colors.info,
    textAlign: "center",
    marginTop: 4,
    fontWeight: "600"
  }
});
