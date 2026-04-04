import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { paymentsApi } from "../../src/api/payments.api";
import { AppScreen } from "../../src/components/app-screen";
import { FormInput } from "../../src/components/form-input";
import { PrimaryButton } from "../../src/components/primary-button";
import { colors } from "../../src/constants/colors";
import { paymentMethods, revenueSources } from "../../src/constants/revenue-types";
import { useAuth } from "../../src/hooks/useAuth";
import { useNetworkStatus } from "../../src/hooks/useNetworkStatus";
import { useOfflineQueue } from "../../src/hooks/useOfflineQueue";
import { paymentSchema, type PaymentSchemaInput } from "../../src/lib/validators";
import { getErrorMessage } from "../../src/utils/error";
import { generateOfflineReferenceId } from "../../src/utils/helpers";

export default function NewPaymentScreen() {
  const { user } = useAuth();
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const isOnline = isConnected && isInternetReachable;
  const { enqueuePayment, addSyncedPayment, transactions } = useOfflineQueue();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const recentPayers = useMemo(
    () => Array.from(new Set(transactions.map((item) => item.payerName))).slice(0, 6),
    [transactions]
  );

  const { control, handleSubmit, watch, setValue, formState, reset } = useForm<PaymentSchemaInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payerName: "",
      payerReference: "",
      revenueSource: "shop_rentals",
      amount: 0,
      paymentMethod: "cash",
      paymentDate: new Date().toISOString().slice(0, 10),
      notes: ""
    }
  });

  const selectedRevenue = watch("revenueSource");
  const selectedMethod = watch("paymentMethod");

  const mutation = useMutation({
    mutationFn: paymentsApi.createPayment
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const offlineReferenceId = generateOfflineReferenceId();
    const payload = {
      ...values,
      notes: values.notes || undefined,
      payerReference: values.payerReference || undefined,
      collectorId: user?.id,
      wardId: user?.wardId,
      offlineReferenceId
    };

    try {
      let record;
      if (isOnline) {
        const response = await mutation.mutateAsync(payload);
        record = addSyncedPayment(payload, response);
      } else {
        record = enqueuePayment(payload);
      }

      reset();
      router.replace({ pathname: "/payment/receipt", params: { localId: record.localId } });
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Payment submission failed."));
    }
  });

  return (
    <AppScreen>
      <Text style={styles.title}>Record Payment</Text>
      <Text style={styles.subtitle}>Collector Ward: {user?.assignedWard ?? "N/A"}</Text>
      <Text style={[styles.status, { color: isOnline ? colors.success : colors.warning }]}>
        {isOnline ? "Online: payment will sync immediately" : "Offline: payment will be queued"}
      </Text>

      <Controller
        control={control}
        name="payerName"
        render={({ field: { value, onChange } }) => (
          <FormInput
            label="Payer"
            placeholder="Enter payer full name"
            value={value}
            onChangeText={onChange}
            error={formState.errors.payerName?.message}
          />
        )}
      />

      {recentPayers.length > 0 && (
        <View style={styles.suggestionWrap}>
          <Text style={styles.suggestionTitle}>Recent payers</Text>
          <View style={styles.tagsWrap}>
            {recentPayers.map((payer) => (
              <Pressable key={payer} style={styles.tag} onPress={() => setValue("payerName", payer)}>
                <Text style={styles.tagText}>{payer}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <Controller
        control={control}
        name="payerReference"
        render={({ field: { value, onChange } }) => (
          <FormInput
            label="Payer Reference (optional)"
            placeholder="Account / stand / shop number"
            value={value || ""}
            onChangeText={onChange}
            error={formState.errors.payerReference?.message}
          />
        )}
      />

      <View style={styles.selectorWrap}>
        <Text style={styles.selectorLabel}>Revenue Source</Text>
        <View style={styles.tagsWrap}>
          {revenueSources.map((item) => (
            <Pressable
              key={item.value}
              onPress={() => setValue("revenueSource", item.value)}
              style={[styles.tag, selectedRevenue === item.value && styles.tagSelected]}
            >
              <Text style={[styles.tagText, selectedRevenue === item.value && styles.tagTextSelected]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Controller
        control={control}
        name="amount"
        render={({ field: { value, onChange } }) => (
          <FormInput
            label="Amount"
            placeholder="0.00"
            value={String(value ?? "")}
            onChangeText={(next) => onChange(Number(next))}
            keyboardType="numeric"
            error={formState.errors.amount?.message}
          />
        )}
      />

      <View style={styles.selectorWrap}>
        <Text style={styles.selectorLabel}>Payment Method</Text>
        <View style={styles.tagsWrap}>
          {paymentMethods.map((item) => (
            <Pressable
              key={item.value}
              onPress={() => setValue("paymentMethod", item.value)}
              style={[styles.tag, selectedMethod === item.value && styles.tagSelected]}
            >
              <Text style={[styles.tagText, selectedMethod === item.value && styles.tagTextSelected]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Controller
        control={control}
        name="paymentDate"
        render={({ field: { value, onChange } }) => (
          <FormInput
            label="Payment Date"
            value={value}
            onChangeText={onChange}
            error={formState.errors.paymentDate?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="notes"
        render={({ field: { value, onChange } }) => (
          <FormInput
            label="Notes"
            placeholder="Optional notes"
            value={value || ""}
            onChangeText={onChange}
            multiline
            error={formState.errors.notes?.message}
          />
        )}
      />

      {submitError && <Text style={styles.error}>{submitError}</Text>}

      <PrimaryButton label="Submit Payment" onPress={onSubmit} loading={mutation.isPending} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary
  },
  subtitle: {
    color: colors.textSecondary
  },
  status: {
    fontWeight: "700"
  },
  suggestionWrap: {
    gap: 6
  },
  suggestionTitle: {
    color: colors.textSecondary,
    fontWeight: "600"
  },
  selectorWrap: {
    gap: 8
  },
  selectorLabel: {
    color: colors.textPrimary,
    fontWeight: "600"
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  tag: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12
  },
  tagSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  tagText: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 12
  },
  tagTextSelected: {
    color: "#fff"
  },
  error: {
    backgroundColor: "#FEE2E2",
    color: colors.danger,
    borderRadius: 8,
    padding: 10,
    fontWeight: "600"
  }
});
