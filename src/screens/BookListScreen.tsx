import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import BookCard from '../components/BookCard';
import CategoryFilter from '../components/CategoryFilter';
import EmptyState from '../components/EmptyState';
import PrimaryButton from '../components/PrimaryButton';
import SearchBar from '../components/SearchBar';
import { useBooks } from '../hooks/useBooks';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Book, CATEGORIES } from '../types/book';
import type { RootStackParamList } from '../types/navigation';
import { ALL_CATEGORIES, filterBooks } from '../utils/bookOperations';

type Props = NativeStackScreenProps<RootStackParamList, 'BookList'>;

const FILTER_OPTIONS = [ALL_CATEGORIES, ...CATEGORIES];

export default function BookListScreen({ navigation }: Props) {
  const { books, totalTitles, totalBorrowed, deleteBook, notify } = useBooks();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);

  const visibleBooks = useMemo(() => filterBooks(books, query, category), [books, query, category]);
  const isFiltering = query.trim().length > 0 || category !== ALL_CATEGORIES;

  const openDetail = useCallback(
    (book: Book) => navigation.navigate('BookDetail', { bookId: book.id }),
    [navigation],
  );

  const confirmDelete = useCallback(
    (book: Book) => {
      if (book.borrowed > 0) {
        Alert.alert(
          'Không thể xóa sách',
          `"${book.title}" đang có ${book.borrowed} cuốn được mượn. Hãy nhận trả hết trước khi xóa.`,
        );
        return;
      }
      Alert.alert('Xóa sách', `Bạn có chắc muốn xóa "${book.title}"?`, [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteBook(book.id);
            if (result.ok) {
              notify('Đã xóa sách.');
            } else {
              Alert.alert('Không thể xóa', result.error);
            }
          },
        },
      ]);
    },
    [deleteBook, notify],
  );

  const renderItem = useCallback(
    ({ item }: { item: Book }) => (
      <BookCard book={item} onPress={() => openDetail(item)} onLongPress={() => confirmDelete(item)} />
    ),
    [openDetail, confirmDelete],
  );

  const clearFilters = () => {
    setQuery('');
    setCategory(ALL_CATEGORIES);
  };

  const goToAdd = () => navigation.navigate('BookForm');

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.headerTitle}>Quản lý thư viện</Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalTitles}</Text>
            <Text style={styles.statLabel}>đầu sách</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalBorrowed}</Text>
            <Text style={styles.statLabel}>cuốn đang mượn</Text>
          </View>
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.searchWrap}>
          <SearchBar value={query} onChangeText={setQuery} />
        </View>
        <CategoryFilter options={FILTER_OPTIONS} selected={category} onSelect={setCategory} />
      </View>

      <FlatList
        data={visibleBooks}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={10}
        ListEmptyComponent={
          books.length === 0 ? (
            <EmptyState
              title="Thư viện chưa có sách"
              message="Thêm cuốn sách đầu tiên để bắt đầu quản lý."
              actionLabel="+ Thêm sách"
              onAction={goToAdd}
            />
          ) : (
            <EmptyState
              title="Không tìm thấy sách phù hợp"
              message="Thử đổi từ khóa hoặc chọn thể loại khác."
              actionLabel={isFiltering ? 'Xóa bộ lọc' : undefined}
              onAction={isFiltering ? clearFilters : undefined}
            />
          )
        }
      />

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <PrimaryButton title="+ Thêm sách" onPress={goToAdd} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerTitle: { ...typography.headline, color: colors.textOnPrimary },
  stats: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  stat: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  statValue: { ...typography.figure, color: colors.textOnPrimary },
  statLabel: { ...typography.body, color: colors.textOnPrimarySoft },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.textOnPrimarySoft,
    opacity: 0.5,
    marginHorizontal: spacing.lg,
  },
  controls: { paddingTop: spacing.md, paddingBottom: spacing.sm },
  searchWrap: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.lg, flexGrow: 1 },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
