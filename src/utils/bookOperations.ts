import { Book, BookInput } from '../types/book';

// Các hàm nghiệp vụ thuần (pure): nhận danh sách hiện tại, trả danh sách mới hoặc lỗi.
// Không thay đổi trực tiếp mảng/đối tượng đầu vào.

export type OpResult = { ok: true; books: Book[] } | { ok: false; error: string };

const fail = (error: string): OpResult => ({ ok: false, error });

export const remaining = (book: Book): number => Math.max(0, book.quantity - book.borrowed);

export function generateId(books: Book[]): string {
  const used = new Set(books.map(b => b.id));
  let counter = 0;
  let id = `${Date.now()}`;
  while (used.has(id)) {
    counter += 1;
    id = `${Date.now()}-${counter}`;
  }
  return id;
}

export function addBookOp(books: Book[], input: BookInput): OpResult {
  const book: Book = { ...input, id: generateId(books), borrowed: 0 };
  return { ok: true, books: [book, ...books] };
}

export function updateBookOp(books: Book[], id: string, input: BookInput): OpResult {
  const current = books.find(b => b.id === id);
  if (!current) return fail('Không tìm thấy sách cần sửa.');
  if (input.quantity < current.borrowed) {
    return fail(`Tổng số cuốn không được nhỏ hơn số cuốn đang mượn (${current.borrowed}).`);
  }
  // Giữ nguyên id và borrowed.
  return {
    ok: true,
    books: books.map(b => (b.id === id ? { ...b, ...input, id: b.id, borrowed: b.borrowed } : b)),
  };
}

export function deleteBookOp(books: Book[], id: string): OpResult {
  const current = books.find(b => b.id === id);
  if (!current) return fail('Không tìm thấy sách cần xóa.');
  if (current.borrowed > 0) {
    return fail(`Sách đang có ${current.borrowed} cuốn được mượn nên không thể xóa.`);
  }
  return { ok: true, books: books.filter(b => b.id !== id) };
}

export function borrowOp(books: Book[], id: string): OpResult {
  const current = books.find(b => b.id === id);
  if (!current) return fail('Không tìm thấy sách.');
  if (current.quantity - current.borrowed <= 0) return fail('Sách đã hết, không thể cho mượn.');
  return { ok: true, books: books.map(b => (b.id === id ? { ...b, borrowed: b.borrowed + 1 } : b)) };
}

export function returnOp(books: Book[], id: string): OpResult {
  const current = books.find(b => b.id === id);
  if (!current) return fail('Không tìm thấy sách.');
  if (current.borrowed <= 0) return fail('Sách này chưa có cuốn nào đang được mượn.');
  return { ok: true, books: books.map(b => (b.id === id ? { ...b, borrowed: b.borrowed - 1 } : b)) };
}

export function getStats(books: Book[]): { totalTitles: number; totalBorrowed: number } {
  return {
    totalTitles: books.length,
    totalBorrowed: books.reduce((sum, b) => sum + b.borrowed, 0),
  };
}

export const ALL_CATEGORIES = 'Tất cả';

export function filterBooks(books: Book[], query: string, category: string): Book[] {
  const q = (query ?? '').trim().toLowerCase();
  return books.filter(b => {
    const matchCategory = category === ALL_CATEGORIES || b.category === category;
    if (!matchCategory) return false;
    if (q.length === 0) return true;
    return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
  });
}
