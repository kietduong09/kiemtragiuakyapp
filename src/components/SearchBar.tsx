import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

export default function SearchBar({ value, onChangeText }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Tìm theo tên sách hoặc tác giả"
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        accessibilityLabel="Ô tìm kiếm sách"
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Xóa nội dung tìm kiếm"
          style={({ pressed }) => [styles.clear, pressed && styles.clearPressed]}>
          <Text style={styles.clearText}>×</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    minHeight: 48,
  },
  input: { flex: 1, ...typography.body, color: colors.textPrimary, paddingVertical: spacing.sm },
  clear: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearPressed: { backgroundColor: colors.chipBg },
  clearText: { fontSize: 22, lineHeight: 24, color: colors.textSecondary },
});
