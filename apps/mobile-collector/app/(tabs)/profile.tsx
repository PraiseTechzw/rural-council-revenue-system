import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppScreen } from "../../src/components/app-screen";
import { PrimaryButton } from "../../src/components/primary-button";
import { colors } from "../../src/constants/colors";
import { useAuth } from "../../src/hooks/useAuth";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const wardLabel = user?.assignedWard ?? (user?.wardId ? "Assigned" : "Not assigned");

  return (
    <AppScreen>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Account</Text>
        <Text style={styles.name}>{user?.name ?? "Collector"}</Text>
        <Text style={styles.body}>Manage your collector profile, role, and assigned ward.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Profile Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email ?? "N/A"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{user?.role ?? "collector"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Assigned Ward</Text>
          <Text style={styles.value}>{wardLabel}</Text>
        </View>
      </View>
      <PrimaryButton
        variant="danger"
        label="Logout"
        onPress={() => {
          void logout().then(() => router.replace("/(auth)/login"));
        }}
      />
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 8
  },
  name: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700"
  },
  body: {
    color: "#D9FFF6",
    lineHeight: 20
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
  label: {
    color: colors.textSecondary,
    flex: 1
  },
  value: {
    color: colors.textPrimary,
    fontWeight: "600",
    textAlign: "right",
    flex: 1
  }
});
