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
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        styleByVariant,
        pressed && !disabled && !loading && styles.pressed,
        (disabled || loading) && styles.disabled
      ]}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 10,
    paddingVertical: spacing.md,
    alignItems: "center"
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92
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
