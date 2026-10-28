import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface Props {
  options: readonly string[];
  selected: string;
  onSelect: (option: string) => void;
  /** true: các nút xuống dòng (dùng trong form). false: cuộn ngang (dùng ở danh sách). */
  wrap?: boolean;
}

export default function CategoryFilter({ options, selected, onSelect, wrap = false }: Props) {
  const chips = options.map(option => {
    const active = option === selected;
    return (
      <Pressable
        key={option}
        onPress={() => onSelect(option)}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        style={({ pressed }) => [
          styles.chip,
          active && styles.chipActive,
          pressed && !active && styles.chipPressed,
        ]}>
        <Text style={[styles.chipText, active && styles.chipTextActive]}>{option}</Text>
      </Pressable>
    );
  });

  if (wrap) {
    return <View style={styles.wrap}>{chips}</View>;
  }
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.row}>
      {chips}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    minHeight: 38,
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipPressed: { backgroundColor: colors.chipBg },
  chipText: { ...typography.label, color: colors.textSecondary },
  chipTextActive: { color: colors.textOnPrimary },
});
