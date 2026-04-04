import { StyleSheet, Text, View } from "react-native";

import { AppScreen } from "../../src/components/app-screen";
import { PrimaryButton } from "../../src/components/primary-button";
import { colors } from "../../src/constants/colors";
import { formatDateTime } from "../../src/lib/format";
import { useSync } from "../../src/hooks/useSync";
import { useSyncStore } from "../../src/store/sync.store";

export default function SyncScreen() {
  const { syncNow, isOnline, isSyncing, pendingCount, error } = useSync();
  const lastSyncAt = useSyncStore((state) => state.lastSyncAt);
  const lastError = useSyncStore((state) => state.lastError);
  const failedItems = useSyncStore((state) => state.failedItems);

  return (
    <AppScreen>
      <View style={styles.card}>
        <Text style={styles.title}>Offline Sync</Text>
        <Text style={styles.meta}>Network: {isOnline ? "Online" : "Offline"}</Text>
        <Text style={styles.meta}>Pending records: {pendingCount}</Text>
        <Text style={styles.meta}>
          Last sync: {lastSyncAt ? formatDateTime(lastSyncAt) : "No sync performed yet"}
        </Text>
      </View>

      {(error || lastError) && <Text style={styles.error}>{error || lastError}</Text>}

      <PrimaryButton
        label={isSyncing ? "Syncing..." : "Sync Pending Payments"}
        onPress={() => {
          void syncNow();
        }}
        loading={isSyncing}
        disabled={!isOnline || pendingCount === 0}
      />

      {failedItems.length > 0 && (
        <View style={styles.failedWrap}>
          <Text style={styles.failedTitle}>Failed Items</Text>
          {failedItems.map((item) => (
            <Text style={styles.failedRow} key={item.localId}>
              {item.localId}: {item.message}
            </Text>
          ))}
        </View>
      )}
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
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary
  },
  meta: {
    color: colors.textSecondary
  },
  error: {
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
    padding: 10,
    color: colors.danger,
    fontWeight: "600"
  },
  failedWrap: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 12,
    gap: 8
  },
  failedTitle: {
    fontWeight: "700",
    color: colors.textPrimary
  },
  failedRow: {
    color: colors.textSecondary,
    fontSize: 12
  }
});
