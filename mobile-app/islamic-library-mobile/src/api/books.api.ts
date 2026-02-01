/**
 * API للكتب
 */

import { api } from './client';
import {
  Book,
  BooksQuery,
  BookDetailResponse,
  BookContentResponse,
  BookContentQuery,
  PaginatedResponse,
  Category,
} from '@/types';

export const booksAPI = {
  /**
   * قائمة الكتب
   */
  getBooks: async (query: BooksQuery = {}): Promise<PaginatedResponse<Book>> => {
    const response = await api.get<PaginatedResponse<Book>>('/books', query);

    if (!response.success || !response.data) {
      throw new Error('فشل جلب قائمة الكتب');
    }

    return response.data;
  },

  /**
   * الكتب الحديثة
   */
  getRecentBooks: async (limit: number = 10): Promise<Book[]> => {
    const response = await api.get<Book[]>('/books/recent', { limit });

    if (!response.success || !response.data) {
      throw new Error('فشل جلب الكتب الحديثة');
    }

    return response.data;
  },

  /**
   * الكتب الشائعة
   */
  getPopularBooks: async (limit: number = 10): Promise<Book[]> => {
    const response = await api.get<Book[]>('/books/popular', { limit });

    if (!response.success || !response.data) {
      throw new Error('فشل جلب الكتب الشائعة');
    }

    return response.data;
  },

  /**
   * تفاصيل الكتاب
   */
  getBookById: async (bookId: string): Promise<BookDetailResponse> => {
    const response = await api.get<BookDetailResponse>(`/books/${bookId}`);

    if (!response.success || !response.data) {
      throw new Error('فشل جلب تفاصيل الكتاب');
    }

    return response.data;
  },

  /**
   * محتوى الكتاب
   */
  getBookContent: async (
    bookId: string,
    query: BookContentQuery = {}
  ): Promise<BookContentResponse> => {
    const response = await api.get<BookContentResponse>(
      `/books/${bookId}/content`,
      query
    );

    if (!response.success || !response.data) {
      throw new Error('فشل جلب محتوى الكتاب');
    }

    return response.data;
  },

  /**
   * البحث في الكتب
   */
  searchBooks: async (
    query: string,
    options: BooksQuery = {}
  ): Promise<PaginatedResponse<Book>> => {
    const response = await api.get<PaginatedResponse<Book>>('/books/search', {
      q: query,
      ...options,
    });

    if (!response.success || !response.data) {
      throw new Error('فشل البحث في الكتب');
    }

    return response.data;
  },

  /**
   * الفئات
   */
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');

    if (!response.success || !response.data) {
      throw new Error('فشل جلب الفئات');
    }

    return response.data;
  },

  /**
   * كتب حسب الفئة
   */
  getBooksByCategory: async (
    categoryId: string,
    query: BooksQuery = {}
  ): Promise<PaginatedResponse<Book>> => {
    const response = await api.get<PaginatedResponse<Book>>(
      `/categories/${categoryId}/books`,
      query
    );

    if (!response.success || !response.data) {
      throw new Error('فشل جلب كتب الفئة');
    }

    return response.data;
  },

  /**
   * كتبي (للمستخدم الحالي)
   */
  getMyBooks: async (query: BooksQuery = {}): Promise<PaginatedResponse<Book>> => {
    const response = await api.get<PaginatedResponse<Book>>('/books/my-books', query);

    if (!response.success || !response.data) {
      throw new Error('فشل جلب كتبي');
    }

    return response.data;
  },

  /**
   * الكتب المنزلة
   */
  getDownloadedBooks: async (): Promise<Book[]> => {
    const response = await api.get<Book[]>('/books/downloaded');

    if (!response.success || !response.data) {
      throw new Error('فشل جلب الكتب المنزلة');
    }

    return response.data;
  },
};
