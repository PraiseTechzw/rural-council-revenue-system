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
      <View style={styles.card}>
        <Text style={styles.title}>Payment Collection</Text>
        <Text style={styles.body}>Use this workflow to capture council revenue payments quickly in the field.</Text>
        <Text style={[styles.status, { color: online ? colors.success : colors.warning }]}>Network: {online ? "Online" : "Offline"}</Text>
        <Text style={styles.pending}>Pending Sync: {pendingCount}</Text>
      </View>

      <PrimaryButton label="Start New Payment" onPress={() => router.push("/payment/new")} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary
  },
  body: {
    color: colors.textSecondary
  },
  status: {
    fontWeight: "700"
  },
  pending: {
    color: colors.textPrimary,
    fontWeight: "600"
  }
});
