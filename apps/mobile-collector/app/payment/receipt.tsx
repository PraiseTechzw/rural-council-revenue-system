import { useMemo } from "react";
import { Link, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { receiptsApi } from "../../src/api/receipts.api";
import { AppScreen } from "../../src/components/app-screen";
import { StatusPill } from "../../src/components/status-pill";
import { colors } from "../../src/constants/colors";
import { formatCurrency, formatDateTime, formatShortDate } from "../../src/lib/format";
import { buildTemporaryReceiptNumber } from "../../src/lib/receipt";
import { usePaymentStore } from "../../src/store/payment.store";
import { useQuery } from "@tanstack/react-query";

function formatMethod(value: string) {
	return value.replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

export default function PaymentReceiptScreen() {
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
        <Text style={styles.error}>Receipt not found.</Text>
      </AppScreen>
    );
  }

  const receiptNo = record.receiptNumber || buildTemporaryReceiptNumber(record.offlineReferenceId);
  const receipt = receiptQuery.data;
  const displayCollector = receipt?.collectorName || record.collectorId || "Pending sync";
  const displayWard = receipt?.ward || record.ward || "-";
  const displayRevenue = receipt?.revenueSource || record.revenueSource;
  const displayPaymentMethod = receipt?.paymentMethod || record.paymentMethod;
  const displayDate = receipt?.paymentDate || record.paymentDate;
  const displayNotes = receipt?.notes ?? record.notes;
  const amount = receipt?.amount ?? record.amount;

  return (
    <AppScreen>
      <View style={styles.receiptShell}>
        <View style={styles.topBand}>
          <Text style={styles.brand}>Rural District Council</Text>
          <Text style={styles.brandSub}>Official Revenue Receipt</Text>
          <Text style={styles.receiptNo}>#{receiptNo}</Text>
          <View style={styles.statusWrap}>
            <StatusPill status={record.syncStatus} />
          </View>
        </View>

        <View style={styles.section}>
          <ReceiptRow label="Payer" value={record.payerName} />
          <ReceiptRow label="Revenue Source" value={displayRevenue} />
          <ReceiptRow label="Amount" value={formatCurrency(amount)} strong />
        </View>

        <View style={styles.divider} />

        <View style={styles.grid}>
          <ReceiptChip label="Collector" value={displayCollector} />
          <ReceiptChip label="Ward" value={displayWard} />
          <ReceiptChip label="Method" value={formatMethod(displayPaymentMethod)} />
          <ReceiptChip label="Date" value={formatShortDate(displayDate)} />
        </View>

        {displayNotes ? (
          <View style={styles.notesCard}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{displayNotes}</Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Keep this receipt for your records.</Text>
          <Text style={styles.footerHint}>Verified at {formatDateTime(record.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Link href={{ pathname: "/payment/details", params: { localId: record.localId } }} style={styles.linkButton}>
          View Full Details
        </Link>
        <Link href="/(tabs)/dashboard" style={styles.linkSecondary}>
          Back to Dashboard
        </Link>
      </View>

      {receiptQuery.isLoading ? <Text style={styles.loadingText}>Loading synced receipt...</Text> : null}
    </AppScreen>
  );
}

function ReceiptRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
	return (
		<View style={styles.rowWrap}>
			<Text style={styles.label}>{label}</Text>
			<Text style={[styles.value, strong && styles.valueStrong]}>{value}</Text>
		</View>
	);
}

function ReceiptChip({ label, value }: { label: string; value: string }) {
	return (
		<View style={styles.chip}>
			<Text style={styles.chipLabel}>{label}</Text>
			<Text style={styles.chipValue}>{value}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
  receiptShell: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3
  },
  topBand: {
    borderRadius: 20,
    backgroundColor: colors.primary,
    padding: 18,
    gap: 4
  },
  brand: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.2
  },
  brandSub: {
    color: "#D9FFF6",
    fontSize: 13
  },
  receiptNo: {
    marginTop: 4,
    color: "#fff",
    fontSize: 22,
    fontWeight: "800"
  },
  statusWrap: {
    marginTop: 8,
    alignSelf: "flex-start"
  },
  section: {
    gap: 8
  },
  rowWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10
  },
  label: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.4
  },
  value: {
    color: colors.textPrimary,
    flex: 1,
    textAlign: "right",
    fontWeight: "600"
  },
  valueStrong: {
    fontSize: 18,
    fontWeight: "800"
  },
  divider: {
    height: 1,
    backgroundColor: colors.border
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  chip: {
    flexBasis: "48%",
    flexGrow: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8FAFC",
    padding: 12,
    gap: 4
  },
  chipLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3
  },
  chipValue: {
    color: colors.textPrimary,
    fontWeight: "700"
  },
  notesCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FCFEFD",
    padding: 14,
    gap: 6
  },
  notesLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  notesText: {
    color: colors.textPrimary,
    lineHeight: 20
  },
  footer: {
    alignItems: "center",
    gap: 4,
    paddingTop: 4
  },
  footerText: {
    color: colors.textPrimary,
    fontWeight: "700"
  },
  footerHint: {
    color: colors.textSecondary,
    fontSize: 12
  },
  actions: {
    gap: 12
  },
  linkButton: {
    backgroundColor: colors.primary,
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    borderRadius: 14,
    paddingVertical: 14,
    overflow: "hidden"
  },
  linkSecondary: {
    textAlign: "center",
    color: colors.textSecondary
  },
  loadingText: {
    color: colors.textSecondary,
    textAlign: "center"
  },
  error: {
    color: colors.danger,
    fontWeight: "700"
  }
});
