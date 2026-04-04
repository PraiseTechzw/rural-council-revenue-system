import { useMemo } from "react";
import { Link, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { StyleSheet, Text, View } from "react-native";

import { receiptsApi } from "../../src/api/receipts.api";
import { AppScreen } from "../../src/components/app-screen";
import { StatusPill } from "../../src/components/status-pill";
import { colors } from "../../src/constants/colors";
import { formatCurrency, formatDateTime } from "../../src/lib/format";
import { usePaymentStore } from "../../src/store/payment.store";

export default function PaymentDetailsScreen() {
  const params = useLocalSearchParams<{ localId?: string }>();
  const localId = Array.isArray(params.localId) ? params.localId[0] : params.localId;
  const transactions = usePaymentStore((state) => state.transactions);

  const record = useMemo(() => transactions.find((item) => item.localId === localId), [localId, transactions]);

  const receiptQuery = useQuery({
    queryKey: ["receipt", record?.serverPaymentId],
    queryFn: () => receiptsApi.getByPaymentId(record?.serverPaymentId || ""),
    enabled: Boolean(record?.serverPaymentId && record?.syncStatus === "synced")
  });

  if (!record) {
    return (
      <AppScreen>
        <Text style={styles.error}>Transaction not found.</Text>
      </AppScreen>
    );
  }

  const receipt = receiptQuery.data;

  return (
    <AppScreen>
      <View style={styles.card}>
        <Text style={styles.title}>Payment Details</Text>
        <StatusPill status={record.syncStatus} />
        <Text style={styles.row}>Payer: {record.payerName}</Text>
        <Text style={styles.row}>Revenue: {record.revenueSource}</Text>
        <Text style={styles.row}>Amount: {formatCurrency(record.amount)}</Text>
        <Text style={styles.row}>Method: {record.paymentMethod}</Text>
        <Text style={styles.row}>Date: {formatDateTime(record.paymentDate)}</Text>
        <Text style={styles.row}>Ward: {record.ward ?? "N/A"}</Text>
        <Text style={styles.row}>Offline Ref: {record.offlineReferenceId}</Text>
        {record.notes ? <Text style={styles.row}>Notes: {record.notes}</Text> : null}
      </View>

      {receiptQuery.isLoading ? <Text style={styles.meta}>Loading synced receipt...</Text> : null}
      {receipt ? <Text style={styles.meta}>Server Receipt: {receipt.receiptNumber}</Text> : null}

      <Link href={{ pathname: "/payment/receipt", params: { localId: record.localId } }} style={styles.link}>
        Open Receipt View
      </Link>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 8
  },
  title: {
    fontWeight: "700",
    fontSize: 20,
    color: colors.textPrimary
  },
  row: {
    color: colors.textSecondary
  },
  meta: {
    color: colors.textSecondary
  },
  link: {
    color: colors.info,
    fontWeight: "700"
  },
  error: {
    color: colors.danger,
    fontWeight: "700"
  }
});
