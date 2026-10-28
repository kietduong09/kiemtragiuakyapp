import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Book } from '../types/book';
import { remaining } from '../utils/bookOperations';

interface Props {
  book: Book;
  onPress: () => void;
  onLongPress: () => void;
}

function BookCard({ book, onPress, onLongPress }: Props) {
  const left = remaining(book);
  const soldOut = left === 0;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      accessibilityRole="button"
      accessibilityHint="Nhấn để xem chi tiết, nhấn giữ để xóa"
      android_ripple={{ color: colors.chipBg }}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {book.author}
        </Text>
        <View style={styles.categoryChip}>
          <Text style={styles.categoryText}>{book.category}</Text>
        </View>
      </View>
      <View style={styles.stock}>
        <Text style={[styles.stockNumber, soldOut && styles.stockNumberEmpty]}>{left}</Text>
        <Text style={styles.stockLabel}>còn lại</Text>
        {soldOut && (
          <View style={styles.soldOut}>
            <Text style={styles.soldOutText}>Hết sách</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default React.memo(BookCard);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardPressed: { backgroundColor: colors.background },
  info: { flex: 1, paddingRight: spacing.md },
  title: { ...typography.title, color: colors.textPrimary },
  author: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  categoryChip: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.chipBg,
  },
  categoryText: { ...typography.caption, color: colors.textSecondary },
  stock: { alignItems: 'center', minWidth: 64 },
  stockNumber: { ...typography.figure, color: colors.primary },
  stockNumberEmpty: { color: colors.danger },
  stockLabel: { ...typography.caption, color: colors.textMuted },
  soldOut: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerSoft,
  },
  soldOutText: { ...typography.caption, color: colors.danger, fontWeight: '700' },
});
