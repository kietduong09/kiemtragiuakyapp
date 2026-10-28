import { Book } from '../types/book';

// Dữ liệu mẫu, chỉ được ghi vào AsyncStorage ở lần chạy đầu tiên.
export const INITIAL_BOOKS: Book[] = [
  { id: 'seed-1', title: 'Toán cao cấp - Tập 1', author: 'Nguyễn Đình Trí', category: 'Giáo trình', year: 2001, quantity: 10, borrowed: 3 },
  { id: 'seed-2', title: 'Số đỏ', author: 'Vũ Trọng Phụng', category: 'Tiểu thuyết', year: 1936, quantity: 4, borrowed: 4 },
  { id: 'seed-3', title: 'Lược sử thời gian', author: 'Stephen Hawking', category: 'Khoa học', year: 1988, quantity: 5, borrowed: 1 },
  { id: 'seed-4', title: 'Dế Mèn phiêu lưu ký', author: 'Tô Hoài', category: 'Thiếu nhi', year: 1941, quantity: 8, borrowed: 2 },
  { id: 'seed-5', title: 'Sapiens: Lược sử loài người', author: 'Yuval Noah Harari', category: 'Khoa học', year: 2011, quantity: 6, borrowed: 0 },
  { id: 'seed-6', title: 'Tôi thấy hoa vàng trên cỏ xanh', author: 'Nguyễn Nhật Ánh', category: 'Tiểu thuyết', year: 2010, quantity: 7, borrowed: 0 },
];
