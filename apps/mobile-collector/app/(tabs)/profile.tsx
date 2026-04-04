import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppScreen } from "../../src/components/app-screen";
import { PrimaryButton } from "../../src/components/primary-button";
import { colors } from "../../src/constants/colors";
import { useAuth } from "../../src/hooks/useAuth";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <AppScreen>
      <View style={styles.card}>
        <Text style={styles.name}>{user?.name ?? "Collector"}</Text>
        <Text style={styles.row}>Email: {user?.email ?? "N/A"}</Text>
        <Text style={styles.row}>Role: {user?.role ?? "collector"}</Text>
        <Text style={styles.row}>Assigned Ward: {user?.assignedWard ?? "Not assigned"}</Text>
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
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 8
  },
  name: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "700"
  },
  row: {
    color: colors.textSecondary
  }
});
