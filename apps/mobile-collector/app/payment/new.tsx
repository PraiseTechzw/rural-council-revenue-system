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

const stepLabels = ["Payer", "Details", "Review"] as const;
const quickAmounts = [5, 10, 20, 50, 100];

export default function NewPaymentScreen() {
  const { user } = useAuth();
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const isOnline = isConnected && isInternetReachable;
  const { enqueuePayment, addSyncedPayment, transactions } = useOfflineQueue();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const recentPayers = useMemo(
    () => Array.from(new Set(transactions.map((item) => item.payerName))).slice(0, 6),
    [transactions]
  );

  const form = useForm<PaymentSchemaInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payerName: "",
      payerReference: "",
      revenueSource: "shop_rental",
      amount: 0,
      paymentMethod: "cash",
      paymentDate: new Date().toISOString().slice(0, 10),
      notes: ""
    }
  });

  const { control, handleSubmit, watch, setValue, trigger, formState, reset } = form;
  const selectedRevenue = watch("revenueSource");
  const selectedMethod = watch("paymentMethod");
  const payerName = watch("payerName");
  const amount = watch("amount");
  const paymentDate = watch("paymentDate");
  const notes = watch("notes");

  const mutation = useMutation({
    mutationFn: paymentsApi.createPayment
  });

  const progress = ((step + 1) / stepLabels.length) * 100;

  const handleNext = async () => {
    const fieldsByStep: Array<Array<keyof PaymentSchemaInput>> = [
      ["payerName", "payerReference"],
      ["revenueSource", "amount", "paymentMethod", "paymentDate"],
      ["notes"]
    ];

    const valid = await trigger(fieldsByStep[step]);
    if (valid) {
      setStep((current) => Math.min(current + 1, stepLabels.length - 1));
    }
  };

  const handleBack = () => setStep((current) => Math.max(current - 1, 0));

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const offlineReferenceId = generateOfflineReferenceId();
    const payload = {
      ...values,
      notes: values.notes || undefined,
      payerReference: values.payerReference || undefined,
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

      reset({
        payerName: "",
        payerReference: "",
        revenueSource: "shop_rental",
        amount: 0,
        paymentMethod: "cash",
        paymentDate: new Date().toISOString().slice(0, 10),
        notes: ""
      });
      setStep(0);
      router.replace({ pathname: "/payment/receipt", params: { localId: record.localId } });
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Payment submission failed."));
    }
  });

  return (
    <AppScreen>
      <View style={styles.headerCard}>
        <Text style={styles.kicker}>New Payment</Text>
        <Text style={styles.title}>Fast collector entry</Text>
        <Text style={styles.subtitle}>Ward: {user?.assignedWard ?? (user?.wardId ? "Assigned ward" : "Not assigned")}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? colors.success : colors.warning }]} />
          <Text style={[styles.statusText, { color: isOnline ? colors.success : colors.warning }]}>
            {isOnline ? "Online mode" : "Offline queue mode"}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.stepRow}>
          {stepLabels.map((label, index) => (
            <View key={label} style={[styles.stepBadge, step === index && styles.stepBadgeActive]}>
              <Text style={[styles.stepBadgeText, step === index && styles.stepBadgeTextActive]}>{index + 1}. {label}</Text>
            </View>
          ))}
        </View>
      </View>

      {step === 0 ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Who paid?</Text>
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

          <Controller
            control={control}
            name="payerReference"
            render={({ field: { value, onChange } }) => (
              <FormInput
                label="Reference / Stand Number"
                placeholder="Optional account, stand, or shop number"
                value={value || ""}
                onChangeText={onChange}
                error={formState.errors.payerReference?.message}
              />
            )}
          />

          {recentPayers.length > 0 ? (
            <View style={styles.suggestionBlock}>
              <Text style={styles.suggestionTitle}>Recent payers</Text>
              <View style={styles.tagWrap}>
                {recentPayers.map((payer) => (
                  <Pressable key={payer} style={styles.tag} onPress={() => setValue("payerName", payer, { shouldValidate: true })}>
                    <Text style={styles.tagText}>{payer}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          <PrimaryButton label="Next" onPress={handleNext} />
        </View>
      ) : null}

      {step === 1 ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment details</Text>
          <View style={styles.suggestionBlock}>
            <Text style={styles.suggestionTitle}>Revenue source</Text>
            <View style={styles.tagWrap}>
              {revenueSources.map((item) => (
                <Pressable
                  key={item.value}
                  onPress={() => setValue("revenueSource", item.value, { shouldValidate: true })}
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
                onChangeText={(next) => onChange(next === "" ? 0 : Number(next))}
                keyboardType="numeric"
                error={formState.errors.amount?.message}
              />
            )}
          />

          <View style={styles.quickAmountRow}>
            {quickAmounts.map((quickAmount) => (
              <Pressable
                key={quickAmount}
                style={styles.quickAmount}
                onPress={() => setValue("amount", quickAmount, { shouldValidate: true })}
              >
                <Text style={styles.quickAmountText}>{quickAmount}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.suggestionBlock}>
            <Text style={styles.suggestionTitle}>Payment method</Text>
            <View style={styles.tagWrap}>
              {paymentMethods.map((item) => (
                <Pressable
                  key={item.value}
                  onPress={() => setValue("paymentMethod", item.value, { shouldValidate: true })}
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
                placeholder="YYYY-MM-DD"
                value={value}
                onChangeText={onChange}
                error={formState.errors.paymentDate?.message}
              />
            )}
          />

          <View style={styles.actionRow}>
            <View style={styles.actionButtonWrap}>
              <PrimaryButton label="Back" variant="secondary" onPress={handleBack} />
            </View>
            <View style={styles.actionButtonWrap}>
              <PrimaryButton label="Review Payment" onPress={handleNext} />
            </View>
          </View>
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Review and submit</Text>
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

          <View style={styles.reviewCard}>
            <ReviewRow label="Payer" value={payerName || "-"} />
            <ReviewRow label="Revenue" value={revenueSources.find((item) => item.value === watch("revenueSource"))?.label ?? "-"} />
            <ReviewRow label="Amount" value={String(amount || 0)} />
            <ReviewRow label="Method" value={paymentMethods.find((item) => item.value === selectedMethod)?.label ?? "-"} />
            <ReviewRow label="Date" value={paymentDate} />
            <ReviewRow label="Notes" value={notes?.trim() ? notes : "None"} />
          </View>

          {submitError ? <Text style={styles.error}>{submitError}</Text> : null}

          <View style={styles.actionRow}>
            <View style={styles.actionButtonWrap}>
              <PrimaryButton label="Back" variant="secondary" onPress={handleBack} />
            </View>
            <View style={styles.actionButtonWrap}>
              <PrimaryButton label={isOnline ? "Submit Now" : "Queue Payment"} onPress={onSubmit} loading={mutation.isPending} />
            </View>
          </View>
        </View>
      ) : null}
    </AppScreen>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 20,
    gap: 10,
    shadowColor: colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4
  },
  kicker: {
    color: "#D9FFF6",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
    fontWeight: "700"
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700"
  },
  subtitle: {
    color: "#D9FFF6"
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 999
  },
  statusText: {
    fontWeight: "700"
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 999
  },
  stepRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap"
  },
  stepBadge: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10
  },
  stepBadgeActive: {
    backgroundColor: "rgba(255,255,255,0.18)"
  },
  stepBadgeText: {
    color: "#E9FDF9",
    fontSize: 12,
    fontWeight: "600"
  },
  stepBadgeTextActive: {
    color: "#fff"
  },
  card: {
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
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700"
  },
  suggestionBlock: {
    gap: 8
  },
  suggestionTitle: {
    color: colors.textSecondary,
    fontWeight: "600"
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  tag: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: 999,
    paddingVertical: 8,
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
  quickAmountRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  quickAmount: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  quickAmountText: {
    color: colors.textPrimary,
    fontWeight: "700"
  },
  actionRow: {
    flexDirection: "column",
    gap: 10
  },
  actionButtonWrap: {
    width: "100%"
  },
  reviewCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    gap: 10
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  reviewLabel: {
    color: colors.textSecondary,
    flex: 1,
    fontWeight: "600"
  },
  reviewValue: {
    color: colors.textPrimary,
    flex: 1,
    textAlign: "right",
    fontWeight: "700"
  },
  error: {
    backgroundColor: "#FEE2E2",
    color: colors.danger,
    borderRadius: 8,
    padding: 10,
    fontWeight: "600"
  }
});
