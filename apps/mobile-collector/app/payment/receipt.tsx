import { useMemo } from "react";
import { Link, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppScreen } from "../../src/components/app-screen";
import { StatusPill } from "../../src/components/status-pill";
import { colors } from "../../src/constants/colors";
import { formatCurrency, formatDateTime } from "../../src/lib/format";
import { buildTemporaryReceiptNumber } from "../../src/lib/receipt";
import { usePaymentStore } from "../../src/store/payment.store";

export default function PaymentReceiptScreen() {
  const params = useLocalSearchParams<{ localId?: string }>();
  const localId = Array.isArray(params.localId) ? params.localId[0] : params.localId;
  const transactions = usePaymentStore((state) => state.transactions);

  const record = useMemo(() => transactions.find((item) => item.localId === localId), [localId, transactions]);

  if (!record) {
    return (
      <AppScreen>
        <Text style={styles.error}>Receipt not found.</Text>
      </AppScreen>
    );
  }

  const receiptNo = record.receiptNumber || buildTemporaryReceiptNumber(record.offlineReferenceId);

  return (
    <AppScreen>
      <View style={styles.receiptBox}>
        <Text style={styles.receiptTitle}>Rural District Council</Text>
        <Text style={styles.subTitle}>Revenue Receipt</Text>
        <Text style={styles.receiptNo}>Receipt #: {receiptNo}</Text>

        <StatusPill status={record.syncStatus} />

        <View style={styles.rowWrap}>
          <Text style={styles.label}>Payer</Text>
          <Text style={styles.value}>{record.payerName}</Text>
        </View>
        <View style={styles.rowWrap}>
          <Text style={styles.label}>Revenue Source</Text>
          <Text style={styles.value}>{record.revenueSource}</Text>
        </View>
        <View style={styles.rowWrap}>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.value}>{formatCurrency(record.amount)}</Text>
        </View>
        <View style={styles.rowWrap}>
          <Text style={styles.label}>Payment Method</Text>
          <Text style={styles.value}>{record.paymentMethod}</Text>
        </View>
        <View style={styles.rowWrap}>
          <Text style={styles.label}>Collector</Text>
          <Text style={styles.value}>{record.collectorId ?? "N/A"}</Text>
        </View>
        <View style={styles.rowWrap}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{formatDateTime(record.paymentDate)}</Text>
        </View>
      </View>

      <Link href={{ pathname: "/payment/details", params: { localId: record.localId } }} style={styles.link}>
        View Full Transaction Details
      </Link>
      <Link href="/(tabs)/dashboard" style={styles.linkSecondary}>
        Back to Dashboard
      </Link>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  receiptBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 10
  },
  receiptTitle: {
    color: colors.textPrimary,
    fontWeight: "800",
    fontSize: 18
  },
  subTitle: {
    color: colors.textSecondary
  },
  receiptNo: {
    color: colors.textPrimary,
    fontWeight: "700"
  },
  rowWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10
  },
  label: {
    color: colors.textSecondary,
    flex: 1
  },
  value: {
    color: colors.textPrimary,
    flex: 1,
    textAlign: "right",
    fontWeight: "600"
  },
  link: {
    color: colors.info,
    fontWeight: "700"
  },
  linkSecondary: {
    color: colors.textSecondary
  },
  error: {
    color: colors.danger,
    fontWeight: "700"
  }
});
