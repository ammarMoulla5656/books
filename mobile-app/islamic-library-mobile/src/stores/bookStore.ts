/**
 * Book Store
 * إدارة حالة الكتب والمفضلة والتحميلات
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Book Type
 */
export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  pages: number;
  thumbnail?: string;
  description?: string;
  rating?: number;
  reviewsCount?: number;
  publishYear?: string;
  language?: string;
  fileSize?: string;
  isFavorite?: boolean;
  isDownloaded?: boolean;
  progress?: number; // 0-100
  lastRead?: string; // ISO date
}

/**
 * Bookmark Type
 */
export interface Bookmark {
  id: string;
  bookId: string;
  page: number;
  title: string;
  createdAt: string;
}

/**
 * Highlight Type
 */
export interface Highlight {
  id: string;
  bookId: string;
  page: number;
  text: string;
  color: string;
  createdAt: string;
}

/**
 * Note Type
 */
export interface Note {
  id: string;
  bookId: string;
  page: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Reading History Entry
 */
export interface ReadingHistoryEntry {
  bookId: string;
  page: number;
  timestamp: string;
  duration: number; // seconds
}

/**
 * Review Type
 */
export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Book Store State
 */
interface BookStoreState {
  // Books
  books: Book[];
  favorites: string[]; // book IDs
  downloaded: string[]; // book IDs

  // Bookmarks, Highlights, Notes
  bookmarks: Bookmark[];
  highlights: Highlight[];
  notes: Note[];

  // Reading History
  readingHistory: ReadingHistoryEntry[];

  // Reviews
  reviews: Review[];

  // Actions - Books
  setBooks: (books: Book[]) => void;
  addBook: (book: Book) => void;
  updateBook: (bookId: string, updates: Partial<Book>) => void;

  // Actions - Favorites
  toggleFavorite: (bookId: string) => void;
  isFavorite: (bookId: string) => boolean;
  getFavoriteBooks: () => Book[];

  // Actions - Downloads
  markAsDownloaded: (bookId: string) => void;
  markAsNotDownloaded: (bookId: string) => void;
  isDownloaded: (bookId: string) => boolean;
  getDownloadedBooks: () => Book[];

  // Actions - Progress
  updateProgress: (bookId: string, progress: number) => void;
  getProgress: (bookId: string) => number;

  // Actions - Bookmarks
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (bookmarkId: string) => void;
  getBookBookmarks: (bookId: string) => Bookmark[];

  // Actions - Highlights
  addHighlight: (highlight: Omit<Highlight, 'id' | 'createdAt'>) => void;
  removeHighlight: (highlightId: string) => void;
  getBookHighlights: (bookId: string) => Highlight[];

  // Actions - Notes
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (noteId: string, content: string) => void;
  removeNote: (noteId: string) => void;
  getBookNotes: (bookId: string) => Note[];

  // Actions - Reading History
  addReadingHistory: (entry: Omit<ReadingHistoryEntry, 'timestamp'>) => void;
  getReadingHistory: () => ReadingHistoryEntry[];
  getBookReadingHistory: (bookId: string) => ReadingHistoryEntry[];
  getTotalReadingTime: () => number; // total seconds

  // Actions - Reviews
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReview: (reviewId: string, comment: string, rating: number) => void;
  removeReview: (reviewId: string) => void;
  getBookReviews: (bookId: string) => Review[];
  getUserReview: (bookId: string, userId: string) => Review | undefined;
  getAverageRating: (bookId: string) => number;

  // Actions - Utility
  clearAll: () => void;
}

/**
 * Book Store
 */
export const useBookStore = create<BookStoreState>()(
  persist(
    (set, get) => ({
      // Initial State
      books: [],
      favorites: [],
      downloaded: [],
      bookmarks: [],
      highlights: [],
      notes: [],
      readingHistory: [],
      reviews: [],

      // Books Actions
      setBooks: (books) => set({ books }),

      addBook: (book) =>
        set((state) => ({
          books: [...state.books, book],
        })),

      updateBook: (bookId, updates) =>
        set((state) => ({
          books: state.books.map((book) =>
            book.id === bookId ? { ...book, ...updates } : book
          ),
        })),

      // Favorites Actions
      toggleFavorite: (bookId) =>
        set((state) => {
          const isFav = state.favorites.includes(bookId);
          return {
            favorites: isFav
              ? state.favorites.filter((id) => id !== bookId)
              : [...state.favorites, bookId],
            books: state.books.map((book) =>
              book.id === bookId ? { ...book, isFavorite: !isFav } : book
            ),
          };
        }),

      isFavorite: (bookId) => get().favorites.includes(bookId),

      getFavoriteBooks: () =>
        get().books.filter((book) => get().favorites.includes(book.id)),

      // Downloads Actions
      markAsDownloaded: (bookId) =>
        set((state) => ({
          downloaded: state.downloaded.includes(bookId)
            ? state.downloaded
            : [...state.downloaded, bookId],
          books: state.books.map((book) =>
            book.id === bookId ? { ...book, isDownloaded: true } : book
          ),
        })),

      markAsNotDownloaded: (bookId) =>
        set((state) => ({
          downloaded: state.downloaded.filter((id) => id !== bookId),
          books: state.books.map((book) =>
            book.id === bookId ? { ...book, isDownloaded: false } : book
          ),
        })),

      isDownloaded: (bookId) => get().downloaded.includes(bookId),

      getDownloadedBooks: () =>
        get().books.filter((book) => get().downloaded.includes(book.id)),

      // Progress Actions
      updateProgress: (bookId, progress) =>
        set((state) => ({
          books: state.books.map((book) =>
            book.id === bookId
              ? { ...book, progress, lastRead: new Date().toISOString() }
              : book
          ),
        })),

      getProgress: (bookId) => {
        const book = get().books.find((b) => b.id === bookId);
        return book?.progress || 0;
      },

      // Bookmarks Actions
      addBookmark: (bookmark) =>
        set((state) => ({
          bookmarks: [
            ...state.bookmarks,
            {
              ...bookmark,
              id: `bm_${Date.now()}_${Math.random()}`,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      removeBookmark: (bookmarkId) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((bm) => bm.id !== bookmarkId),
        })),

      getBookBookmarks: (bookId) =>
        get().bookmarks.filter((bm) => bm.bookId === bookId),

      // Highlights Actions
      addHighlight: (highlight) =>
        set((state) => ({
          highlights: [
            ...state.highlights,
            {
              ...highlight,
              id: `hl_${Date.now()}_${Math.random()}`,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      removeHighlight: (highlightId) =>
        set((state) => ({
          highlights: state.highlights.filter((hl) => hl.id !== highlightId),
        })),

      getBookHighlights: (bookId) =>
        get().highlights.filter((hl) => hl.bookId === bookId),

      // Notes Actions
      addNote: (note) =>
        set((state) => ({
          notes: [
            ...state.notes,
            {
              ...note,
              id: `nt_${Date.now()}_${Math.random()}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateNote: (noteId, content) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? { ...note, content, updatedAt: new Date().toISOString() }
              : note
          ),
        })),

      removeNote: (noteId) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== noteId),
        })),

      getBookNotes: (bookId) =>
        get().notes.filter((note) => note.bookId === bookId),

      // Reading History Actions
      addReadingHistory: (entry) =>
        set((state) => ({
          readingHistory: [
            ...state.readingHistory,
            {
              ...entry,
              timestamp: new Date().toISOString(),
            },
          ],
        })),

      getReadingHistory: () => get().readingHistory,

      getBookReadingHistory: (bookId) =>
        get().readingHistory.filter((entry) => entry.bookId === bookId),

      getTotalReadingTime: () =>
        get().readingHistory.reduce((total, entry) => total + entry.duration, 0),

      // Reviews Actions
      addReview: (review) =>
        set((state) => ({
          reviews: [
            ...state.reviews,
            {
              ...review,
              id: `rv_${Date.now()}_${Math.random()}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateReview: (reviewId, comment, rating) =>
        set((state) => ({
          reviews: state.reviews.map((review) =>
            review.id === reviewId
              ? {
                  ...review,
                  comment,
                  rating,
                  updatedAt: new Date().toISOString(),
                }
              : review
          ),
        })),

      removeReview: (reviewId) =>
        set((state) => ({
          reviews: state.reviews.filter((review) => review.id !== reviewId),
        })),

      getBookReviews: (bookId) =>
        get().reviews.filter((review) => review.bookId === bookId),

      getUserReview: (bookId, userId) =>
        get().reviews.find(
          (review) => review.bookId === bookId && review.userId === userId
        ),

      getAverageRating: (bookId) => {
        const bookReviews = get().reviews.filter(
          (review) => review.bookId === bookId
        );
        if (bookReviews.length === 0) return 0;
        const total = bookReviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        return Math.round((total / bookReviews.length) * 10) / 10; // Round to 1 decimal
      },

      // Utility Actions
      clearAll: () =>
        set({
          books: [],
          favorites: [],
          downloaded: [],
          bookmarks: [],
          highlights: [],
          notes: [],
          readingHistory: [],
          reviews: [],
        }),
    }),
    {
      name: 'book-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
