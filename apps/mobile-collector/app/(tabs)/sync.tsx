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
      <View style={styles.hero}>
        <Text style={styles.kicker}>Background jobs</Text>
        <Text style={styles.title}>Offline Sync</Text>
        <Text style={styles.body}>Review unsent payments and push them when the network is back.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Sync Status</Text>
        <View style={styles.row}>
          <Text style={styles.metaLabel}>Network</Text>
          <Text style={[styles.metaValue, { color: isOnline ? colors.success : colors.warning }]}>{isOnline ? "Online" : "Offline"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.metaLabel}>Pending records</Text>
          <Text style={styles.metaValue}>{pendingCount}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.metaLabel}>Last sync</Text>
          <Text style={styles.metaValue}>{lastSyncAt ? formatDateTime(lastSyncAt) : "No sync performed yet"}</Text>
        </View>
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
  body: {
    color: "#D9FFF6",
    lineHeight: 20
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 8
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff"
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  metaLabel: {
    color: colors.textSecondary
  },
  metaValue: {
    color: colors.textPrimary,
    fontWeight: "700",
    textAlign: "right",
    flex: 1
  },
  error: {
    borderRadius: 16,
    backgroundColor: "#FEE2E2",
    padding: 10,
    color: colors.danger,
    fontWeight: "600"
  },
  failedWrap: {
    borderRadius: 20,
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
