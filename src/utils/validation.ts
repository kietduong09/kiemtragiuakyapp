import { BookCategory, BookInput } from '../types/book';

export const MIN_YEAR = 1900;
export const MAX_QUANTITY = 9999;
export const MAX_TITLE_LENGTH = 200;
export const MAX_AUTHOR_LENGTH = 100;

export interface BookFormValues {
  title: string;
  author: string;
  category: BookCategory;
  year: string;
  quantity: string;
}

export type BookFormField = 'title' | 'author' | 'year' | 'quantity';
export type BookFormErrors = Partial<Record<BookFormField, string>>;

const INTEGER_PATTERN = /^\d+$/;

/**
 * Kiểm tra dữ liệu form. Không phụ thuộc vào keyboardType.
 * `borrowed` là số cuốn đang mượn của sách đang sửa (0 khi thêm mới).
 */
export function validateBookForm(
  values: BookFormValues,
  borrowed: number = 0,
  currentYear: number = new Date().getFullYear(),
): { errors: BookFormErrors; input: BookInput | null } {
  const errors: BookFormErrors = {};

  const title = values.title.trim();
  const author = values.author.trim();
  const yearText = values.year.trim();
  const quantityText = values.quantity.trim();

  if (title.length === 0) {
    errors.title = 'Vui lòng nhập tên sách.';
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.title = `Tên sách tối đa ${MAX_TITLE_LENGTH} ký tự.`;
  }

  if (author.length === 0) {
    errors.author = 'Vui lòng nhập tên tác giả.';
  } else if (author.length > MAX_AUTHOR_LENGTH) {
    errors.author = `Tên tác giả tối đa ${MAX_AUTHOR_LENGTH} ký tự.`;
  }

  let year = NaN;
  if (yearText.length === 0) {
    errors.year = 'Vui lòng nhập năm xuất bản.';
  } else if (!INTEGER_PATTERN.test(yearText) || yearText.length > 4) {
    errors.year = 'Năm xuất bản phải là số nguyên.';
  } else {
    year = Number(yearText);
    if (year < MIN_YEAR || year > currentYear) {
      errors.year = `Năm xuất bản phải từ ${MIN_YEAR} đến ${currentYear}.`;
    }
  }

  let quantity = NaN;
  if (quantityText.length === 0) {
    errors.quantity = 'Vui lòng nhập tổng số cuốn.';
  } else if (!INTEGER_PATTERN.test(quantityText) || quantityText.length > 4) {
    errors.quantity = `Số lượng phải là số nguyên từ 1 đến ${MAX_QUANTITY}.`;
  } else {
    quantity = Number(quantityText);
    if (quantity <= 0) {
      errors.quantity = 'Số lượng phải lớn hơn 0.';
    } else if (quantity > MAX_QUANTITY) {
      errors.quantity = `Số lượng tối đa ${MAX_QUANTITY}.`;
    } else if (quantity < borrowed) {
      errors.quantity = `Hiện có ${borrowed} cuốn đang được mượn, tổng số cuốn không được nhỏ hơn.`;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors, input: null };
  }
  return { errors, input: { title, author, category: values.category, year, quantity } };
}
