import { StyleSheet, Text, View } from "react-native";

import { colors } from "../constants/colors";

type StatusPillProps = {
  status: "pending" | "synced" | "failed";
};

const statusMap = {
  pending: { label: "Pending", bg: "#FEF3C7", text: "#92400E" },
  synced: { label: "Synced", bg: "#DCFCE7", text: "#166534" },
  failed: { label: "Failed", bg: "#FEE2E2", text: "#B91C1C" }
};

export function StatusPill({ status }: StatusPillProps) {
  const config = statusMap[status];

  return (
    <View style={[styles.pill, { backgroundColor: config.bg }]}> 
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start"
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary
  }
});
