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
  const wardLabel = user?.assignedWard ?? (user?.wardId ? "Assigned ward" : "Not assigned");

  const todayRecords = transactions.filter((tx) => isToday(tx.paymentDate));
  const todayAmount = todayRecords.reduce((sum, tx) => sum + tx.amount, 0);
  const syncRate = transactions.length === 0 ? 100 : Math.round(((transactions.length - pendingCount) / transactions.length) * 100);

  return (
    <AppScreen>
      <View style={styles.hero}>
        <Text style={styles.heroKicker}>Daily Overview</Text>
        <Text style={styles.greeting}>Welcome back, {user?.name ?? "Collector"}</Text>
        <Text style={styles.ward}>Ward: {wardLabel}</Text>
        <View style={styles.heroPills}>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillLabel}>Today</Text>
            <Text style={styles.heroPillValue}>{todayRecords.length}</Text>
          </View>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillLabel}>Sync</Text>
            <Text style={styles.heroPillValue}>{syncRate}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Today's Revenue</Text>
          <Text style={styles.cardValue}>{formatCurrency(todayAmount)}</Text>
          <Text style={styles.cardHint}>Collected from active field sessions.</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Unsynced Payments</Text>
          <Text style={[styles.cardValue, pendingCount > 0 && styles.warnText]}>{pendingCount}</Text>
          <Text style={styles.cardHint}>{pendingCount === 0 ? "Nothing waiting to sync." : "Send these when network is available."}</Text>
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
    borderRadius: 24,
    padding: 20,
    gap: 8,
    shadowColor: colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4
  },
  heroKicker: {
    color: "#D9FFF6",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
    fontWeight: "700"
  },
  greeting: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 24,
    lineHeight: 30
  },
  ward: {
    color: "#D9FFF6",
    fontSize: 13
  },
  heroPills: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8
  },
  heroPill: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    padding: 12,
    gap: 4
  },
  heroPillLabel: {
    color: "#D9FFF6",
    fontSize: 12,
    fontWeight: "600"
  },
  heroPillValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700"
  },
  statsGrid: {
    gap: 12
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
    gap: 8
  },
  cardLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600"
  },
  cardValue: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "700"
  },
  cardHint: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18
  },
  warnText: {
    color: colors.warning
  },
  actionsWrap: {
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary
  }
});
