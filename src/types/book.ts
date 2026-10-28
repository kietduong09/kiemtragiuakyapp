export const CATEGORIES = ['Giáo trình', 'Tiểu thuyết', 'Khoa học', 'Thiếu nhi'] as const;

export type BookCategory = (typeof CATEGORIES)[number];

export interface Book {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  year: number;
  quantity: number;
  borrowed: number;
}

// Dữ liệu người dùng nhập (không gồm id và borrowed).
export type BookInput = Omit<Book, 'id' | 'borrowed'>;
