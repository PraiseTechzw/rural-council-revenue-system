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
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline, Boolean(error) && styles.errorInput]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
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
    paddingVertical: spacing.sm,
    color: colors.textPrimary
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
