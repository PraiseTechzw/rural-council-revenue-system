import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppScreen } from "../../src/components/app-screen";
import { PrimaryButton } from "../../src/components/primary-button";
import { colors } from "../../src/constants/colors";
import { formatCurrency } from "../../src/lib/format";
import { useAuth } from "../../src/hooks/useAuth";
import { useOfflineQueue } from "../../src/hooks/useOfflineQueue";
import { isToday } from "../../src/utils/helpers";

export default function DashboardScreen() {
  const { user } = useAuth();
  const { transactions, pendingCount } = useOfflineQueue();

  const todayRecords = transactions.filter((tx) => isToday(tx.paymentDate));
  const todayAmount = todayRecords.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <AppScreen>
      <View style={styles.hero}>
        <Text style={styles.greeting}>Hello, {user?.name ?? "Collector"}</Text>
        <Text style={styles.ward}>Ward: {user?.assignedWard ?? "Not assigned"}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Today's Transactions</Text>
          <Text style={styles.cardValue}>{todayRecords.length}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Today's Revenue</Text>
          <Text style={styles.cardValue}>{formatCurrency(todayAmount)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Unsynced Payments</Text>
          <Text style={[styles.cardValue, pendingCount > 0 && styles.warnText]}>{pendingCount}</Text>
        </View>
      </View>

      <View style={styles.actionsWrap}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <PrimaryButton label="Collect New Payment" onPress={() => router.push("/payment/new")} />
        <PrimaryButton label="View Transactions" variant="secondary" onPress={() => router.push("/(tabs)/transactions")} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 16,
    gap: 4
  },
  greeting: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 22
  },
  ward: {
    color: "#D9FFF6"
  },
  statsGrid: {
    gap: 10
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    gap: 8
  },
  cardLabel: {
    color: colors.textSecondary
  },
  cardValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700"
  },
  warnText: {
    color: colors.warning
  },
  actionsWrap: {
    gap: 10
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary
  }
});
