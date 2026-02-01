/**
 * أنواع النماذج الأساسية
 */

// المستخدم
export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  phoneNumber?: string;
  phoneVerified: boolean;
  bio?: string;
  isPremium: boolean;
  premiumExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// الفئة
export interface Category {
  id: string;
  arabicName: string;
  englishName: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  isActive: boolean;
  booksCount?: number;
}

// الكتاب
export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverImage?: string;
  categoryId: string;
  category?: Category;
  pageCount: number;
  publishDate?: string;
  language: string;
  isbn?: string;
  publisher?: string;

  // للموبايل
  allowOffline: boolean;
  offlineSize?: number;
  audioUrl?: string;
  audioSize?: number;
  pdfUrl?: string;
  pdfSize?: number;
  epubUrl?: string;
  epubSize?: number;

  // الإحصائيات
  viewCount: number;
  downloadCount: number;
  rating?: number;
  ratingCount: number;

  // التواريخ
  createdAt: string;
  updatedAt: string;

  // بيانات إضافية
  isDownloaded?: boolean;
  readingProgress?: ReadingProgress;
  bookmarksCount?: number;
  highlightsCount?: number;
}

// الفصل
export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  order: number;
  sections?: Section[];
}

// القسم
export interface Section {
  id: string;
  chapterId: string;
  title: string;
  content: string;
  order: number;
  pageCount: number;
}

// تقدم القراءة
export interface ReadingProgress {
  id: string;
  userId: string;
  bookId: string;
  currentPage: number;
  totalPages: number;
  percentage: number;
  lastPosition?: {
    chapterId: string;
    sectionId: string;
    scrollPosition: number;
  };
  startedAt: string;
  lastReadAt: string;
  completedAt?: string;
  readingTime: number; // بالدقائق
}

// العلامة المرجعية
export interface Bookmark {
  id: string;
  userId: string;
  bookId: string;
  book?: Book;
  chapterId: string;
  sectionId: string;
  pageNumber: number;
  note?: string;
  createdAt: string;
}

// التظليل
export interface Highlight {
  id: string;
  userId: string;
  bookId: string;
  book?: Book;
  chapterId: string;
  sectionId: string;
  text: string;
  color: string;
  note?: string;
  pageNumber: number;
  position: {
    start: number;
    end: number;
  };
  createdAt: string;
}

// الإشعار
export interface Notification {
  id: string;
  userId?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  type: 'new_book' | 'update' | 'reminder' | 'achievement' | 'system';
  priority: 'high' | 'normal' | 'low';
  isRead: boolean;
  isSent: boolean;
  sentAt?: string;
  createdAt: string;
}

// التنزيل
export interface Download {
  id: string;
  userId: string;
  bookId: string;
  book?: Book;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number;
  fileSize?: number;
  downloadedSize: number;
  startedAt?: string;
  completedAt?: string;
  expiresAt?: string;
  error?: string;
}

// الجهاز
export interface Device {
  id: string;
  userId: string;
  deviceToken: string;
  deviceType: 'ios' | 'android';
  deviceModel?: string;
  osVersion?: string;
  appVersion: string;
  isActive: boolean;
  lastSeen: string;
  createdAt: string;
}

// الإحصائيات
export interface Statistics {
  totalBooksRead: number;
  totalPagesRead: number;
  totalReadingTime: number;
  currentStreak: number;
  longestStreak: number;
  favoriteCategory?: string;
  recentBooks: Book[];
  weeklyProgress: Array<{
    day: string;
    pages: number;
    minutes: number;
  }>;
}
