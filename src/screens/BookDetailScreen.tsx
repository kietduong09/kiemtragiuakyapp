import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import EmptyState from '../components/EmptyState';
import PrimaryButton from '../components/PrimaryButton';
import { useBooks } from '../hooks/useBooks';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { RootStackParamList } from '../types/navigation';
import { remaining } from '../utils/bookOperations';

type Props = NativeStackScreenProps<RootStackParamList, 'BookDetail'>;

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function BookDetailScreen({ navigation, route }: Props) {
  const bookId = route.params?.bookId;
  const { books, borrowBook, returnBook, notify } = useBooks();
  // Luôn lấy từ nguồn dữ liệu chung nên không bao giờ lỗi thời.
  const book = books.find(b => b.id === bookId);

  if (!book) {
    return (
      <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
        <EmptyState
          title="Không tìm thấy sách"
          message="Sách này có thể đã bị xóa."
          actionLabel="Quay lại danh sách"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const left = remaining(book);
  const canBorrow = left > 0;
  const canReturn = book.borrowed > 0;

  const handleBorrow = async () => {
    const result = await borrowBook(book.id);
    notify(result.ok ? 'Đã cho mượn 1 cuốn.' : result.error, result.ok ? 'success' : 'error');
  };

  const handleReturn = async () => {
    const result = await returnBook(book.id);
    notify(result.ok ? 'Đã nhận trả 1 cuốn.' : result.error, result.ok ? 'success' : 'error');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>{book.author}</Text>

        <View style={[styles.status, canBorrow ? styles.statusOk : styles.statusEmpty]}>
          <Text style={[styles.statusText, canBorrow ? styles.statusTextOk : styles.statusTextEmpty]}>
            {canBorrow ? 'Còn sách' : 'Hết sách'}
          </Text>
        </View>

        <View style={styles.card}>
          <InfoRow label="Thể loại" value={book.category} />
          <InfoRow label="Năm xuất bản" value={String(book.year)} />
          <InfoRow label="Tổng số cuốn" value={String(book.quantity)} />
          <InfoRow label="Đang được mượn" value={String(book.borrowed)} />
          <InfoRow label="Còn lại" value={String(left)} last />
        </View>

        <View style={styles.actions}>
          <PrimaryButton title="Cho mượn" onPress={handleBorrow} disabled={!canBorrow} style={styles.actionButton} />
          <PrimaryButton
            title="Nhận trả"
            variant="secondary"
            onPress={handleReturn}
            disabled={!canReturn}
            style={styles.actionButton}
          />
        </View>

        <PrimaryButton
          title="Sửa thông tin sách"
          variant="secondary"
          onPress={() => navigation.navigate('BookForm', { bookId: book.id })}
          style={styles.editButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 3 },
  title: { ...typography.headline, color: colors.textPrimary },
  author: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  status: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  statusOk: { backgroundColor: colors.successSoft },
  statusEmpty: { backgroundColor: colors.dangerSoft },
  statusText: { ...typography.label },
  statusTextOk: { color: colors.success },
  statusTextEmpty: { color: colors.danger },
  card: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    gap: spacing.lg,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { ...typography.body, color: colors.textSecondary },
  rowValue: { ...typography.bodyStrong, color: colors.textPrimary, flexShrink: 1, textAlign: 'right' },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  actionButton: { flex: 1 },
  editButton: { marginTop: spacing.md },
});
