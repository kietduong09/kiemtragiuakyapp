import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle, StyleProp } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Variant = 'primary' | 'secondary' | 'danger';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
}

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
}: Props) {
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant].container,
        pressed && variantStyles[variant].pressed,
        disabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? colors.primary : colors.textOnPrimary} />
      ) : (
        <Text style={[styles.text, variantStyles[variant].text, disabled && styles.disabledText]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  text: { ...typography.button },
  disabled: { backgroundColor: colors.disabledBg, borderColor: colors.disabledBg },
  disabledText: { color: colors.disabledText },
});

const variantStyles = {
  primary: StyleSheet.create({
    container: { backgroundColor: colors.primary, borderColor: colors.primary },
    pressed: { backgroundColor: colors.primaryPressed, borderColor: colors.primaryPressed },
    text: { color: colors.textOnPrimary },
  }),
  secondary: StyleSheet.create({
    container: { backgroundColor: colors.surface, borderColor: colors.border },
    pressed: { backgroundColor: colors.chipBg },
    text: { color: colors.primary },
  }),
  danger: StyleSheet.create({
    container: { backgroundColor: colors.danger, borderColor: colors.danger },
    pressed: { opacity: 0.85 },
    text: { color: colors.textOnPrimary },
  }),
};
