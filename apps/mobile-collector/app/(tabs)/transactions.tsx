import { useMemo, useState } from "react";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppScreen } from "../../src/components/app-screen";
import { StatusPill } from "../../src/components/status-pill";
import { colors } from "../../src/constants/colors";
import { formatCurrency, formatShortDate } from "../../src/lib/format";
import { useOfflineQueue } from "../../src/hooks/useOfflineQueue";

export default function TransactionsScreen() {
  const { transactions } = useOfflineQueue();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "synced" | "failed">("all");

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesFilter = filter === "all" ? true : tx.syncStatus === filter;
      const q = query.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 || tx.payerName.toLowerCase().includes(q) || tx.revenueSource.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [filter, query, transactions]);

  return (
    <AppScreen>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search payer or revenue source"
        style={styles.search}
      />

      <View style={styles.filterRow}>
        {(["all", "pending", "synced", "failed"] as const).map((item) => (
          <Pressable
            key={item}
            onPress={() => setFilter(item)}
            style={[styles.filterPill, filter === item && styles.filterPillActive]}
          >
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No transactions found.</Text>
        </View>
      ) : (
        filtered.map((tx) => (
          <Pressable
            key={tx.localId}
            style={styles.row}
            onPress={() => router.push({ pathname: "/payment/details", params: { localId: tx.localId } })}
          >
            <View style={styles.rowTop}>
              <Text style={styles.payer}>{tx.payerName}</Text>
              <StatusPill status={tx.syncStatus} />
            </View>
            <Text style={styles.meta}>{tx.revenueSource}</Text>
            <Text style={styles.meta}>{formatShortDate(tx.paymentDate)}</Text>
            <Text style={styles.amount}>{formatCurrency(tx.amount)}</Text>
          </Pressable>
        ))
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  search: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    color: colors.textPrimary
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600"
  },
  filterTextActive: {
    color: "#fff"
  },
  emptyBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16
  },
  emptyText: {
    color: colors.textSecondary
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 4
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  payer: {
    fontWeight: "700",
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 13
  },
  amount: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700"
  }
});
