import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppScreen } from "../../src/components/app-screen";
import { FormInput } from "../../src/components/form-input";
import { PrimaryButton } from "../../src/components/primary-button";
import { colors } from "../../src/constants/colors";
import { collectorLoginSchema, type CollectorLoginInput } from "../../src/features/auth";
import { useAuth } from "../../src/hooks/useAuth";
import { getErrorMessage } from "../../src/utils/error";

export default function LoginScreen() {
  const { login, setError, errorMessage } = useAuth();
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
      <View style={styles.header}>
        <Text style={styles.title}>Collector Sign In</Text>
        <Text style={styles.subtitle}>Rural District Council Revenue Collection</Text>
      </View>

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
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 20,
    marginBottom: 12,
    gap: 4
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary
  },
  subtitle: {
    color: colors.textSecondary
  },
  errorBanner: {
    backgroundColor: "#FEE2E2",
    color: colors.danger,
    borderRadius: 10,
    padding: 10,
    fontWeight: "600"
  },
  forgotLink: {
    color: colors.info,
    textAlign: "center",
    marginTop: 10,
    fontWeight: "600"
  }
});
