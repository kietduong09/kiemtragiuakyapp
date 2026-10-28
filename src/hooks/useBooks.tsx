import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { loadBooks, saveBooks } from '../services/bookStorage';
import { Book, BookInput } from '../types/book';
import {
  OpResult,
  addBookOp,
  borrowOp,
  deleteBookOp,
  getStats,
  returnOp,
  updateBookOp,
} from '../utils/bookOperations';

type Status = 'loading' | 'ready' | 'error';
export type MutationResult = { ok: true } | { ok: false; error: string };
export interface Notice {
  id: number;
  text: string;
  type: 'success' | 'error';
}

interface BooksContextValue {
  books: Book[];
  status: Status;
  loadError: string | null;
  totalTitles: number;
  totalBorrowed: number;
  notice: Notice | null;
  notify: (text: string, type?: 'success' | 'error') => void;
  reload: () => void;
  addBook: (input: BookInput) => Promise<MutationResult>;
  updateBook: (id: string, input: BookInput) => Promise<MutationResult>;
  deleteBook: (id: string) => Promise<MutationResult>;
  borrowBook: (id: string) => Promise<MutationResult>;
  returnBook: (id: string) => Promise<MutationResult>;
}

const BooksContext = createContext<BooksContextValue | null>(null);

const SAVE_ERROR = 'Không thể lưu dữ liệu. Thay đổi chưa được áp dụng, vui lòng thử lại.';

export function BooksProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  // booksRef luôn giữ dữ liệu mới nhất => mọi thao tác tính từ dữ liệu mới, không từ closure cũ.
  const booksRef = useRef<Book[]>([]);
  const readyRef = useRef(false);
  // Hàng đợi tuần tự: các thao tác ghi chạy lần lượt, không ghi đè lẫn nhau.
  const queueRef = useRef<Promise<unknown>>(Promise.resolve());
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noticeCounter = useRef(0);

  const load = useCallback(async () => {
    setStatus('loading');
    setLoadError(null);
    try {
      const data = await loadBooks();
      booksRef.current = data;
      readyRef.current = true;
      setBooks(data);
      setStatus('ready');
    } catch (error) {
      console.error('[useBooks] Không đọc được dữ liệu:', error);
      readyRef.current = false;
      setLoadError('Không thể đọc dữ liệu đã lưu. Dữ liệu cũ vẫn được giữ nguyên.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
    return () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, [load]);

  const notify = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeCounter.current += 1;
    setNotice({ id: noticeCounter.current, text, type });
    noticeTimer.current = setTimeout(() => setNotice(null), 2400);
  }, []);

  const mutate = useCallback(
    (operation: (current: Book[]) => OpResult): Promise<MutationResult> => {
      const task = queueRef.current.then(async (): Promise<MutationResult> => {
        if (!readyRef.current) {
          return { ok: false, error: 'Dữ liệu chưa sẵn sàng.' };
        }
        const result = operation(booksRef.current);
        if (!result.ok) {
          return { ok: false, error: result.error };
        }
        try {
          await saveBooks(result.books); // Lưu thành công rồi mới cập nhật state.
        } catch (error) {
          console.error('[useBooks] Lỗi ghi AsyncStorage:', error);
          return { ok: false, error: SAVE_ERROR };
        }
        booksRef.current = result.books;
        setBooks(result.books);
        return { ok: true };
      });
      queueRef.current = task.catch(() => undefined);
      return task;
    },
    [],
  );

  const addBook = useCallback((input: BookInput) => mutate(cur => addBookOp(cur, input)), [mutate]);
  const updateBook = useCallback(
    (id: string, input: BookInput) => mutate(cur => updateBookOp(cur, id, input)),
    [mutate],
  );
  const deleteBook = useCallback((id: string) => mutate(cur => deleteBookOp(cur, id)), [mutate]);
  const borrowBook = useCallback((id: string) => mutate(cur => borrowOp(cur, id)), [mutate]);
  const returnBook = useCallback((id: string) => mutate(cur => returnOp(cur, id)), [mutate]);

  const value = useMemo<BooksContextValue>(() => {
    const stats = getStats(books);
    return {
      books,
      status,
      loadError,
      totalTitles: stats.totalTitles,
      totalBorrowed: stats.totalBorrowed,
      notice,
      notify,
      reload: load,
      addBook,
      updateBook,
      deleteBook,
      borrowBook,
      returnBook,
    };
  }, [books, status, loadError, notice, notify, load, addBook, updateBook, deleteBook, borrowBook, returnBook]);

  return <BooksContext.Provider value={value}>{children}</BooksContext.Provider>;
}

export function useBooks(): BooksContextValue {
  const ctx = useContext(BooksContext);
  if (!ctx) {
    throw new Error('useBooks phải được dùng bên trong <BooksProvider>.');
  }
  return ctx;
}
