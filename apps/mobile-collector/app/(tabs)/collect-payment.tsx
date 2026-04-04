import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppScreen } from "../../src/components/app-screen";
import { PrimaryButton } from "../../src/components/primary-button";
import { colors } from "../../src/constants/colors";
import { useNetworkStatus } from "../../src/hooks/useNetworkStatus";
import { useOfflineQueue } from "../../src/hooks/useOfflineQueue";

export default function CollectPaymentScreen() {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const { pendingCount } = useOfflineQueue();
  const online = isConnected && isInternetReachable;

  return (
    <AppScreen>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Collection Flow</Text>
        <Text style={styles.title}>Payment Collection</Text>
        <Text style={styles.body}>Capture council revenue quickly in the field, then sync when the network is available.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Current Status</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Network</Text>
          <Text style={[styles.status, { color: online ? colors.success : colors.warning }]}>{online ? "Online" : "Offline"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Pending Sync</Text>
          <Text style={styles.pending}>{pendingCount}</Text>
        </View>
      </View>

      <PrimaryButton label="Start New Payment" onPress={() => router.push("/payment/new")} />
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
  kicker: {
    color: "#D9FFF6",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
    fontWeight: "700"
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff"
  },
  body: {
    color: "#D9FFF6",
    lineHeight: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  label: {
    color: colors.textSecondary,
    fontWeight: "600"
  },
  status: {
    fontWeight: "700"
  },
  pending: {
    color: colors.textPrimary,
    fontWeight: "700"
  }
});
