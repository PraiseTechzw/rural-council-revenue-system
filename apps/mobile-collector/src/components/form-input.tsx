import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors, spacing } from "../constants/colors";

type FormInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  multiline?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  secureTextEntry?: boolean;
};

export function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline,
  keyboardType,
  secureTextEntry
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline, isFocused && styles.focused, Boolean(error) && styles.errorInput]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#94A3B8"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs
  },
  label: {
    color: colors.textPrimary,
    fontWeight: "600"
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textPrimary
  },
  focused: {
    borderColor: colors.primary,
    backgroundColor: "#FCFEFD",
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: "top"
  },
  errorInput: {
    borderColor: colors.danger
  },
  errorText: {
    color: colors.danger,
    fontSize: 12
  }
});
