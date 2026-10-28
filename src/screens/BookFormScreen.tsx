import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import BookFormField from '../components/BookFormField';
import CategoryFilter from '../components/CategoryFilter';
import EmptyState from '../components/EmptyState';
import PrimaryButton from '../components/PrimaryButton';
import { useBooks } from '../hooks/useBooks';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { BookCategory, CATEGORIES } from '../types/book';
import type { RootStackParamList } from '../types/navigation';
import {
  BookFormField as FieldName,
  BookFormValues,
  MAX_AUTHOR_LENGTH,
  MAX_TITLE_LENGTH,
  validateBookForm,
} from '../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'BookForm'>;

const EMPTY_TOUCHED: Record<FieldName, boolean> = {
  title: false,
  author: false,
  year: false,
  quantity: false,
};

export default function BookFormScreen({ navigation, route }: Props) {
  const bookId = route.params?.bookId;
  const isEdit = bookId !== undefined;
  const { books, addBook, updateBook, notify } = useBooks();
  const editingBook = useMemo(() => (isEdit ? books.find(b => b.id === bookId) : undefined), [books, bookId, isEdit]);

  const [values, setValues] = useState<BookFormValues>(() => ({
    title: editingBook?.title ?? '',
    author: editingBook?.author ?? '',
    category: editingBook?.category ?? CATEGORIES[0],
    year: editingBook ? String(editingBook.year) : '',
    quantity: editingBook ? String(editingBook.quantity) : '',
  }));
  const [touched, setTouched] = useState(EMPTY_TOUCHED);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Android: chừa chỗ cuộn bằng chiều cao bàn phím để nút Lưu không bị che
  // (kể cả khi hệ thống không tự resize cửa sổ, ví dụ Android 15 edge-to-edge).
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', e => setKeyboardHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // Số cuốn đang mượn lấy từ dữ liệu mới nhất, dùng để ràng buộc quantity.
  const borrowed = editingBook?.borrowed ?? 0;
  const { errors, input } = useMemo(() => validateBookForm(values, borrowed), [values, borrowed]);

  if (isEdit && !editingBook) {
    return (
      <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
        <EmptyState
          title="Không tìm thấy sách"
          message="Sách này có thể đã bị xóa."
          actionLabel="Quay lại"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const setField = <K extends keyof BookFormValues>(key: K, value: BookFormValues[K]) =>
    setValues(prev => ({ ...prev, [key]: value }));
  const markTouched = (key: FieldName) => setTouched(prev => ({ ...prev, [key]: true }));
  const errorFor = (key: FieldName) => (touched[key] || submitted ? errors[key] : undefined);

  const handleSave = async () => {
    if (savingRef.current) return; // chặn nhấn lưu nhiều lần
    setSubmitted(true);
    if (!input) return;

    savingRef.current = true;
    setSaving(true);
    const result = isEdit && bookId ? await updateBook(bookId, input) : await addBook(input);
    savingRef.current = false;
    setSaving(false);

    if (result.ok) {
      notify(isEdit ? 'Đã cập nhật sách.' : 'Đã thêm sách mới.');
      navigation.goBack();
    } else {
      Alert.alert('Không thể lưu', result.error);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: spacing.xxl * 2 + keyboardHeight }]}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets>
          <BookFormField
            label="Tên sách"
            value={values.title}
            onChangeText={t => setField('title', t)}
            onBlur={() => markTouched('title')}
            error={errorFor('title')}
            placeholder="Ví dụ: Lược sử thời gian"
            maxLength={MAX_TITLE_LENGTH + 20}
            multiline
          />
          <BookFormField
            label="Tác giả"
            value={values.author}
            onChangeText={t => setField('author', t)}
            onBlur={() => markTouched('author')}
            error={errorFor('author')}
            placeholder="Ví dụ: Stephen Hawking"
            maxLength={MAX_AUTHOR_LENGTH + 20}
          />

          <Text style={styles.label}>Thể loại</Text>
          <View style={styles.categoryWrap}>
            <CategoryFilter
              wrap
              options={CATEGORIES}
              selected={values.category}
              onSelect={c => setField('category', c as BookCategory)}
            />
          </View>

          <BookFormField
            label="Năm xuất bản"
            value={values.year}
            onChangeText={t => setField('year', t)}
            onBlur={() => markTouched('year')}
            error={errorFor('year')}
            placeholder="Ví dụ: 2020"
            keyboardType="number-pad"
            maxLength={6}
          />
          <BookFormField
            label="Tổng số cuốn"
            value={values.quantity}
            onChangeText={t => setField('quantity', t)}
            onBlur={() => markTouched('quantity')}
            error={errorFor('quantity')}
            placeholder="Ví dụ: 5"
            keyboardType="number-pad"
            maxLength={7}
          />
          {isEdit && borrowed > 0 && (
            <Text style={styles.hint}>Đang có {borrowed} cuốn được mượn, số lượng không thể nhỏ hơn giá trị này.</Text>
          )}

          <View style={styles.actions}>
            <PrimaryButton
              title="Hủy"
              variant="secondary"
              onPress={() => navigation.goBack()}
              disabled={saving}
              style={styles.actionButton}
            />
            <PrimaryButton
              title={isEdit ? 'Lưu thay đổi' : 'Lưu sách'}
              onPress={handleSave}
              loading={saving}
              style={styles.actionButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.lg },
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.xs },
  categoryWrap: { marginBottom: spacing.lg },
  hint: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.lg },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  actionButton: { flex: 1 },
});
