import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { colors, spacing } from "../constants/colors";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger";
};

export function PrimaryButton({ label, onPress, disabled, loading, variant = "primary" }: PrimaryButtonProps) {
  const styleByVariant = {
    primary: styles.primary,
    secondary: styles.secondary,
    danger: styles.danger
  }[variant];

  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={[styles.base, styleByVariant, disabled && styles.disabled]}>
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    paddingVertical: spacing.md,
    alignItems: "center"
  },
  label: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700"
  },
  primary: {
    backgroundColor: colors.primary
  },
  secondary: {
    backgroundColor: colors.info
  },
  danger: {
    backgroundColor: colors.danger
  },
  disabled: {
    opacity: 0.6
  }
});
