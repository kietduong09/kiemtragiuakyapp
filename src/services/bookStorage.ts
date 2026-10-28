import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_BOOKS } from '../constants/initialBooks';
import { Book, CATEGORIES } from '../types/book';

const STORAGE_KEY = '@LibraryApp/books';
const CORRUPT_BACKUP_KEY = '@LibraryApp/books_corrupt_backup';

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

function isValidBook(value: unknown): value is Book {
  if (typeof value !== 'object' || value === null) return false;
  const b = value as Record<string, unknown>;
  const currentYear = new Date().getFullYear();
  return (
    isNonEmptyString(b.id) &&
    isNonEmptyString(b.title) &&
    isNonEmptyString(b.author) &&
    typeof b.category === 'string' &&
    (CATEGORIES as readonly string[]).includes(b.category) &&
    Number.isInteger(b.year) &&
    (b.year as number) >= 1900 &&
    (b.year as number) <= currentYear &&
    Number.isInteger(b.quantity) &&
    (b.quantity as number) > 0 &&
    Number.isInteger(b.borrowed) &&
    (b.borrowed as number) >= 0 &&
    (b.borrowed as number) <= (b.quantity as number)
  );
}

/** Phân tích JSON đã lưu. Trả null nếu dữ liệu hỏng hoàn toàn. */
export function parseBooks(raw: string): { books: Book[]; dropped: number } | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;

  const seen = new Set<string>();
  const books: Book[] = [];
  for (const item of parsed) {
    if (isValidBook(item) && !seen.has(item.id)) {
      seen.add(item.id);
      books.push(item);
    }
  }
  if (parsed.length > 0 && books.length === 0) return null;
  return { books, dropped: parsed.length - books.length };
}

export async function saveBooks(books: Book[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

/**
 * Đọc dữ liệu khi khởi động.
 * - Chưa có dữ liệu (lần chạy đầu): ghi dữ liệu mẫu.
 * - Dữ liệu hỏng: sao lưu bản gốc rồi khôi phục dữ liệu mẫu.
 * - Lỗi đọc AsyncStorage: ném lỗi lên trên (KHÔNG ghi đè dữ liệu cũ).
 */
export async function loadBooks(): Promise<Book[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);

  if (raw === null) {
    await saveBooks(INITIAL_BOOKS);
    return INITIAL_BOOKS;
  }

  const result = parseBooks(raw);
  if (result === null) {
    console.warn('[bookStorage] Dữ liệu lưu không hợp lệ, khôi phục dữ liệu mẫu.');
    await AsyncStorage.setItem(CORRUPT_BACKUP_KEY, raw);
    await saveBooks(INITIAL_BOOKS);
    return INITIAL_BOOKS;
  }

  if (result.dropped > 0) {
    console.warn(`[bookStorage] Bỏ qua ${result.dropped} bản ghi không hợp lệ.`);
    await AsyncStorage.setItem(CORRUPT_BACKUP_KEY, raw);
    await saveBooks(result.books);
  }
  return result.books;
}
