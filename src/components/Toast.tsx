import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBooks } from '../hooks/useBooks';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

/** Thông báo ngắn không chặn thao tác (thay cho Alert với thao tác nhỏ). */
export default function Toast() {
  const { notice } = useBooks();
  const insets = useSafeAreaInsets();
  if (!notice) return null;
  const isError = notice.type === 'error';
  return (
    <View pointerEvents="none" style={[styles.wrapper, { bottom: insets.bottom + 92 }]}>
      <View style={[styles.toast, isError ? styles.error : styles.success]}>
        <Text style={styles.text}>{notice.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', left: spacing.lg, right: spacing.lg, alignItems: 'center' },
  toast: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    maxWidth: '100%',
    elevation: 6,
  },
  success: { backgroundColor: colors.success },
  error: { backgroundColor: colors.danger },
  text: { ...typography.bodyStrong, color: colors.textOnPrimary },
});
