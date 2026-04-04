import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppScreen } from "../../src/components/app-screen";
import { colors } from "../../src/constants/colors";

export default function ForgotPasswordScreen() {
  return (
    <AppScreen>
      <View style={styles.card}>
        <Text style={styles.title}>Password Reset</Text>
        <Text style={styles.message}>
          Contact your system administrator to reset your collector account password.
        </Text>
      </View>
      <Link href="/(auth)/login" style={styles.backLink}>
        Back to Login
      </Link>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary
  },
  message: {
    color: colors.textSecondary,
    lineHeight: 20
  },
  backLink: {
    color: colors.info,
    fontWeight: "700"
  }
});
