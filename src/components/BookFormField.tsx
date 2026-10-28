import React from 'react';
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  multiline?: boolean;
}

export default function BookFormField({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  placeholder,
  keyboardType,
  maxLength,
  multiline,
}: Props) {
  const hasError = Boolean(error);
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline, hasError && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        accessibilityLabel={label}
      />
      {hasError && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.xs },
  input: {
    ...typography.body,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  multiline: { minHeight: 72, textAlignVertical: 'top' },
  inputError: { borderColor: colors.danger, borderWidth: 1.5, backgroundColor: colors.dangerSoft },
  error: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
});
